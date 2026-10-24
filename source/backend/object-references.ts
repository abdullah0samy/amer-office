import type {Queryable} from '../db/raw';
import {validObjectKey} from './storage';
export type ObjectReference={id:string;key:string;size:number;type:string};
/** Both client documents and owner-uploaded office templates are private R2 objects. */
export async function objectReferences(db:Queryable):Promise<ObjectReference[]>{
 const refs:ObjectReference[]=(await db.query('SELECT id,key,size,type FROM documents ORDER BY id')).rows;
 for(const row of (await db.query('SELECT id,data FROM "officeTemplates" ORDER BY id')).rows){const t=JSON.parse(row.data);if(t.id!==row.id||!Array.isArray(t.pages))throw new Error('Invalid template metadata');
  for(const [i,a]of [t,...t.pages].entries()){if(typeof a.key!=='string'||typeof a.mime!=='string'||!Number.isSafeInteger(a.size)||a.size<=0)throw new Error('Invalid template object');refs.push({id:`template:${row.id}:${i}`,key:a.key,size:a.size,type:a.mime});}
 }
 const unique=new Map<string,ObjectReference>();for(const r of refs){validObjectKey(r.key);if(!Number.isSafeInteger(r.size)||r.size<=0)throw new Error('Invalid object size');const prior=unique.get(r.key);if(prior&&(prior.size!==r.size||prior.type!==r.type))throw new Error('Conflicting object references');unique.set(r.key,r);}
 return [...unique.values()].sort((a,b)=>a.key.localeCompare(b.key));
}
