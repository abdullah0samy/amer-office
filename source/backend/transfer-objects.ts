import {S3Client,GetObjectCommand,PutObjectCommand} from '@aws-sdk/client-s3';
import {createHash} from 'node:crypto';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pool} from '../db/raw';
import {r2Client,validObjectKey} from './storage';
import {objectReferences} from './object-references';
const sha=(b:Uint8Array)=>createHash('sha256').update(b).digest('hex');
export async function transferObjects(mode:string,directory:string){const report:any[]=[];
try{if(!['export','import','copy-source'].includes(mode)||(!directory&&mode!=='copy-source'))throw new Error('Usage: transfer-objects export|import /private/directory OR copy-source');
 const rows=await objectReferences(pool);
 const source=mode==='copy-source'?new S3Client({endpoint:process.env.SOURCE_R2_ENDPOINT,region:process.env.SOURCE_R2_REGION||'auto',credentials:{accessKeyId:process.env.SOURCE_R2_ACCESS_KEY_ID!,secretAccessKey:process.env.SOURCE_R2_SECRET_ACCESS_KEY!}}):undefined;
 let manifest:any[]=[];if(mode==='import')manifest=JSON.parse(await readFile(join(directory,'manifest.json'),'utf8'));
 if(mode==='export')await mkdir(directory,{recursive:true,mode:0o700});
 for(const row of rows){const key=validObjectKey(row.key),fileName=sha(new TextEncoder().encode(key))+'.bin',filename=join(directory||'.',fileName);let bytes:Uint8Array;
 if(mode==='import'){const m=manifest.find(m=>m.id===row.id&&m.key===key);if(!m)throw new Error('Missing object manifest entry');bytes=await readFile(filename);if(sha(bytes)!==m.sha256)throw new Error('Backup checksum mismatch');}
 else {const object=await (source||r2Client()).send(new GetObjectCommand({Bucket:source?process.env.SOURCE_R2_BUCKET:process.env.R2_BUCKET,Key:key}));if(!object.Body)throw new Error('Missing source object');bytes=await object.Body.transformToByteArray();}
 if(bytes.byteLength!==Number(row.size))throw new Error('Object size mismatch');
 if(mode==='export')await writeFile(filename,bytes,{flag:'wx',mode:0o600});else{await r2Client().send(new PutObjectCommand({Bucket:process.env.R2_BUCKET,Key:key,Body:bytes,ContentType:row.type}));const check=await r2Client().send(new GetObjectCommand({Bucket:process.env.R2_BUCKET,Key:key}));if(!check.Body||sha(await check.Body.transformToByteArray())!==sha(bytes))throw new Error('Destination checksum mismatch');}
 report.push({id:row.id,key,fileName,size:bytes.length,type:row.type,sha256:sha(bytes)});
 }
 if(mode==='export')await writeFile(join(directory,'manifest.json'),JSON.stringify(report,null,2),{flag:'wx',mode:0o600});
 return {event:'objects_verified',mode,count:report.length,manifest:mode==='export'?resolve(directory,'manifest.json'):undefined};
}catch(e){throw new Error(`Object transfer failed after ${report.length} objects (${(e as any)?.name||'error'})`);}
}
if(process.argv[1]?.endsWith('/transfer-objects.js')||process.argv[1]?.endsWith('/transfer-objects.ts')){try{console.log(JSON.stringify(await transferObjects(process.argv[2],process.argv[3])));}catch(e){console.error(JSON.stringify({event:'object_transfer_failed',message:e instanceof Error?e.message:'error'}));process.exitCode=1;}finally{await pool.end();}}

