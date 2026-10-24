import {readdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pool,type Queryable} from '../db/raw';
export async function migrate(db:Queryable,dir='migrations'){
 await db.query('BEGIN');try{
 await db.query('SELECT pg_advisory_xact_lock(709412032)');
 await db.query('CREATE TABLE IF NOT EXISTS office_schema_migrations (name TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
 const known=await db.query('SELECT name,checksum FROM office_schema_migrations');
 const files=(await readdir(dir)).filter(f=>/^\d+.*\.sql$/.test(f)).sort();
 for(const row of known.rows)if(!files.includes(row.name))throw new Error('Unknown migration in target');
 for(const name of files){const sql=await readFile(`${dir}/${name}`,'utf8'),checksum=createHash('sha256').update(sql).digest('hex'),applied=known.rows.find(r=>r.name===name);if(applied){if(applied.checksum!==checksum)throw new Error(`Migration checksum mismatch: ${name}`);continue;}
 await db.query(sql);await db.query('INSERT INTO office_schema_migrations(name,checksum) VALUES ($1,$2)',[name,checksum]);}
 await db.query('COMMIT');return files.length;
 }catch(e){await db.query('ROLLBACK');throw e;}
}
if(process.argv[1]?.endsWith('/migrate.js')||process.argv[1]?.endsWith('/migrate.ts')){const client=await pool.connect();try{const n=await migrate(client);console.log(JSON.stringify({event:'migrations_complete',count:n}));}catch(e){console.error(JSON.stringify({event:'migration_failed',message:e instanceof Error?e.message:'error'}));process.exitCode=1;}finally{client.release();await pool.end();}}
