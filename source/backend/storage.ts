import {S3Client,PutObjectCommand,GetObjectCommand,DeleteObjectCommand} from '@aws-sdk/client-s3';
import {required} from './config';
import {onStorageRollback} from './storage-hooks';
let client:S3Client|undefined;
export function r2Client(){return client??=new S3Client({endpoint:required('R2_ENDPOINT'),region:process.env.R2_REGION||'auto',credentials:{accessKeyId:required('R2_ACCESS_KEY_ID'),secretAccessKey:required('R2_SECRET_ACCESS_KEY')},forcePathStyle:process.env.R2_FORCE_PATH_STYLE==='true',maxAttempts:3,requestHandler:{connectionTimeout:5000,requestTimeout:20000}});}
export function validObjectKey(key:string){if(!/^(documents\/[a-f0-9-]{36}|office-templates\/[a-f0-9-]{36}\/[a-f0-9-]{36}\/(word\.docx|page-\d+\.jpg))$/.test(key))throw new Error('INVALID_OBJECT_KEY');return key;}
export const storage={
 async put(key:string,body:ArrayBuffer|Uint8Array,options?:{httpMetadata?:{contentType?:string}}){const result=await r2Client().send(new PutObjectCommand({Bucket:required('R2_BUCKET'),Key:validObjectKey(key),Body:new Uint8Array(body),ContentType:options?.httpMetadata?.contentType||'application/octet-stream'}));onStorageRollback(()=>storage.delete(key));return result;},
 async get(key:string){try{const r=await r2Client().send(new GetObjectCommand({Bucket:required('R2_BUCKET'),Key:validObjectKey(key)}));if(!r.Body)return null;return {get body(){return r.Body!.transformToWebStream();},async arrayBuffer(){const b=await r.Body!.transformToByteArray();return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength) as ArrayBuffer;},size:r.ContentLength};}catch(e:any){if(e.name==='NoSuchKey'||e.$metadata?.httpStatusCode===404)return null;throw e;}},
 async delete(key:string){await r2Client().send(new DeleteObjectCommand({Bucket:required('R2_BUCKET'),Key:validObjectKey(key)}));}
};
