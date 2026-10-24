import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import schema from '../db/schema.json';
import type {Queryable} from '../db/raw';
export const businessSchema=schema as Record<string,Array<{name:string;type:string;notnull:boolean;pk:boolean}>>;
export const quote=(s:string)=>'"'+s.replaceAll('"','""')+'"';
export async function readExport(path:string){const v=JSON.parse(await readFile(path,'utf8'));if(v.version!==1||!v.tables||Object.keys(v.tables).sort().join()!==Object.keys(schema).sort().join())throw new Error('Invalid export table inventory');
 for(const [table,cols]of Object.entries(businessSchema)){if(!Array.isArray(v.tables[table]))throw new Error('Invalid rows');const seen=new Set();for(const row of v.tables[table]){
 if(Object.keys(row).sort().join()!==cols.map(c=>c.name).sort().join())throw new Error('Column mismatch: '+table);
 for(const c of cols){const value=row[c.name];if((c.notnull||c.pk)&&value===null)throw new Error('Null required field');if(value!==null){if(typeof value!=='string')throw new Error('Export values must be text or null');if(c.type.toLowerCase()==='integer'&&(!/^-?\d+$/.test(value)||!Number.isSafeInteger(Number(value))))throw new Error('Unsafe integer');}}
 const pk=cols.filter(c=>c.pk).map(c=>row[c.name]).join(':');if(seen.has(pk))throw new Error('Duplicate source primary key');seen.add(pk);
 }}return v.tables as Record<string,any[]>;
}
function manifest(table:string,rows:any[]){const cols=businessSchema[table],keys=cols.map(c=>c.name),pk=cols.filter(c=>c.pk).map(c=>c.name);const normalized=rows.map(r=>Object.fromEntries(keys.map(k=>[k,r[k]==null?null:String(r[k])]))).sort((a,b)=>JSON.stringify(pk.map(k=>a[k])).localeCompare(JSON.stringify(pk.map(k=>b[k]))));const totals:Record<string,string>={};
 for(const c of cols.filter(c=>c.type.toLowerCase()==='integer'&&['amount','discount','price','size'].includes(c.name)))totals[c.name]=normalized.reduce((sum,r)=>sum+BigInt(r[c.name]||0),0n).toString();
 return {count:rows.length,totals,sha256:createHash('sha256').update(JSON.stringify(normalized)).digest('hex')};}
export async function verifyData(db:Queryable,tables:Record<string,any[]>){const results=[];for(const table of Object.keys(businessSchema)){const rows=(await db.query(`SELECT * FROM ${quote(table)}`)).rows,source=manifest(table,tables[table]),destination=manifest(table,rows);if(JSON.stringify(source)!==JSON.stringify(destination))throw new Error('Data verification failed: '+table);results.push({table,...destination});}return results;}
export async function importData(db:Queryable,tables:Record<string,any[]>){await db.query('BEGIN');try{await db.query('SELECT pg_advisory_xact_lock(709412031)');await db.query('SET CONSTRAINTS ALL DEFERRED');for(const table of Object.keys(businessSchema)){if((await db.query(`SELECT 1 FROM ${quote(table)} LIMIT 1`)).rows.length)throw new Error('Destination must be empty: '+table);}
 for(const [table,cols]of Object.entries(businessSchema))for(const row of tables[table])await db.query(`INSERT INTO ${quote(table)} (${cols.map(c=>quote(c.name)).join(',')}) VALUES (${cols.map((_,i)=>'$'+(i+1)).join(',')})`,cols.map(c=>row[c.name]));
 await db.query('SET CONSTRAINTS ALL IMMEDIATE');const report=await verifyData(db,tables);await db.query('COMMIT');return report;
 }catch(e){await db.query('ROLLBACK');throw e;}}
