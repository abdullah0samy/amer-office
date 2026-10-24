import pg from 'pg';
import {AsyncLocalStorage} from 'node:async_hooks';
import {postgresSQL} from '../backend/sql';
import {storage} from '../backend/storage';
import {storageRollback} from '../backend/storage-hooks';
function safeNumber(s:string){const n=Number(s);if(!Number.isSafeInteger(n))throw new Error('UNSAFE_DATABASE_INTEGER');return n;}
pg.types.setTypeParser(20,safeNumber);pg.types.setTypeParser(1700,safeNumber);
export const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,max:Number(process.env.DB_POOL_SIZE||10),connectionTimeoutMillis:10000,idleTimeoutMillis:30000,statement_timeout:30000,application_name:'amer-office'});
pool.on('error',()=>console.error(JSON.stringify({event:'database_pool_error'})));
export type Queryable={query:(sql:string,args?:any[])=>Promise<{rows:any[];rowCount?:number|null}>};
const scope=new AsyncLocalStorage<Queryable>();
export function connection(){return scope.getStore()||pool;}
export function withConnection<T>(client:Queryable,fn:()=>Promise<T>){return scope.run(client,fn);}
export type StatementResult<T=any>={results:T[];meta:{changes:number};success:boolean};
class Statement {
 constructor(readonly sql:string,readonly args:any[]=[]){ }
 bind(...args:any[]){return new Statement(this.sql,args);}
 async all<T=any>():Promise<StatementResult<T>>{const r=await connection().query(postgresSQL(this.sql),this.args);return {results:r.rows,meta:{changes:r.rowCount||0},success:true};}
 async first<T=any>(column?:string):Promise<T|null>{const row=(await this.all<any>()).results[0];return row?(column?row[column]:row):null;}
 async run(){return this.all();}
}
const db={prepare(sql:string){return new Statement(sql);},async batch<T=any>(statements:Statement[]):Promise<StatementResult<T>[]>{
 if(scope.getStore()){const results=[];for(const s of statements)results.push(await s.all<T>());return results;}
 const client=await pool.connect();try{await client.query('BEGIN');return await withConnection(client,async()=>{try{const results=[];for(const s of statements)results.push(await s.all<T>());await client.query('COMMIT');return results;}catch(e){await client.query('ROLLBACK');throw e;}});}finally{client.release();}
}};
export function database(){return db;}
export function bucket(){return storage;}
/** Entire business operation + audit atomic. Serialize writers before their first read.
 * READ COMMITTED after lock acquisition sees previous committed balances; no stale snapshot.
 * Global lock intentionally favors correctness for a small office over write throughput. */
export async function businessTransaction(fn:()=>Promise<Response>,write:boolean){
 const client=await pool.connect(),cleanup:Array<()=>Promise<unknown>>=[];let committed=false,commitStarted=false,uncertain=false;
 try{await client.query(write?'BEGIN':'BEGIN ISOLATION LEVEL REPEATABLE READ');if(write)await client.query('SELECT pg_advisory_xact_lock(709412031)');
 const response=await storageRollback.run(cleanup,()=>withConnection(client,fn));
 if(response.status>=400)await client.query('ROLLBACK');else{commitStarted=true;await client.query('COMMIT');committed=true;}
 return response;
 }catch(e){uncertain=commitStarted&&!committed;try{await client.query('ROLLBACK');}catch{}if(uncertain)console.error(JSON.stringify({event:'transaction_commit_uncertain'}));throw e;
 }finally{client.release(uncertain);if(!committed&&!uncertain)for(const fn of cleanup)try{await fn();}catch{console.error(JSON.stringify({event:'storage_rollback_cleanup_failed'}));}}
}
