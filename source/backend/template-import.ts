import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {businessTransaction,database} from '../db/raw';
import {storage} from './storage';
import {digest,validDocx,jpegDimensions,MAX_WORD,MAX_PAGE,MAX_PAGES,type OfficeTemplate} from '../lib/office-template-upload';
import {audit} from '../lib/office-auth';
/** Operator-only import of private legacy templates. Never invoked at normal startup. */
export async function importOfficeTemplates(directory:string){
 const rawFiles=await readFile(join(directory,'files.json'),'utf8'),rawImages=await readFile(join(directory,'images.json'),'utf8');
 if(rawFiles.length+rawImages.length>64*1024*1024)throw new Error('Private asset bundle too large');
 const files=JSON.parse(rawFiles),images=JSON.parse(rawImages);if(!Array.isArray(files)||files.length>100)throw new Error('Invalid asset bundle');let count=0;
 for(const f of files){if(!/^[a-zA-Z0-9-]{1,100}$/.test(f.id)||typeof f.title!=='string'||typeof f.filename!=='string'||/[/\\\x00-\x1f]/.test(f.filename))throw new Error('Invalid template metadata');
  const word=new Uint8Array(Buffer.from(f.base64,'base64')),pages=images[f.id];if(!validDocx(word)||word.byteLength>MAX_WORD||word.byteLength!==f.size||await digest(word)!==f.sha256||!Array.isArray(pages)||pages.length>MAX_PAGES)throw new Error('Invalid template asset');
  const pageData:Uint8Array[]=[];for(const [i,p]of pages.entries()){const b=new Uint8Array(Buffer.from(p.base64,'base64')),dim=jpegDimensions(b);if(!dim||p.number!==i+1||b.length>MAX_PAGE||b.length!==p.size||dim.width!==p.width||dim.height!==p.height||await digest(b)!==p.sha256)throw new Error('Invalid page asset');pageData.push(b);}
  await businessTransaction(async()=>{const existing=await database().prepare('SELECT data FROM officeTemplates WHERE id=?').bind(f.id).first<{data:string}>();
   if(existing){const t=JSON.parse(existing.data) as OfficeTemplate;if(t.sha256!==f.sha256||t.pages.map(p=>p.sha256).join()!==pages.map((p:any)=>p.sha256).join())throw new Error('Conflicting existing template');
    for(const a of [t,...t.pages]){const object=await storage.get(a.key!);if(!object||await digest(new Uint8Array(await object.arrayBuffer()))!==a.sha256)throw new Error('Existing asset verification failed');}
    return Response.json({ok:true});}
   const prefix=`office-templates/${randomUUID()}/${randomUUID()}`;
   const t:OfficeTemplate={id:f.id,title:f.title,category:String(f.category||'توكيلات'),description:String(f.description||''),filename:f.filename,mime:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',size:word.length,sha256:f.sha256,key:prefix+'/word.docx',pages:pages.map((p:any,i:number)=>({number:i+1,width:p.width,height:p.height,filename:p.filename,mime:'image/jpeg',size:p.size,sha256:p.sha256,key:prefix+`/page-${i+1}.jpg`}))};
   await storage.put(t.key!,word,{httpMetadata:{contentType:t.mime}});for(const [i,b]of pageData.entries())await storage.put(t.pages[i].key!,b,{httpMetadata:{contentType:'image/jpeg'}});
   await database().batch([database().prepare('INSERT INTO officeTemplates (id,sha256,data,created) VALUES (?,?,?,?)').bind(t.id,t.sha256,JSON.stringify(t),new Date().toISOString()),audit(process.env.OFFICE_OWNER_EMAIL||'operator','استيراد نموذج مكتب خاص: '+t.id)]);return Response.json({ok:true});
  },true);count++;
 }
 return {verifiedTemplates:count};
}
