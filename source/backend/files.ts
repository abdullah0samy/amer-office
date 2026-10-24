const csv=(b:Uint8Array)=>!b.includes(0);
const types:Record<string,{ext:string[];signature:(b:Uint8Array)=>boolean}>={
 'text/csv':{ext:['csv'],signature:csv},'text/plain':{ext:['csv'],signature:csv},
 'application/pdf':{ext:['pdf'],signature:b=>Buffer.from(b.subarray(0,5)).toString()==='%PDF-'},
 'image/jpeg':{ext:['jpg','jpeg'],signature:b=>b[0]===255&&b[1]===216&&b[2]===255},
 'image/png':{ext:['png'],signature:b=>Buffer.from(b.subarray(0,8)).equals(Buffer.from([137,80,78,71,13,10,26,10]))},
 'application/msword':{ext:['doc'],signature:ole},'application/vnd.ms-excel':{ext:['xls'],signature:ole},
 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':{ext:['docx'],signature:zip},
 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':{ext:['xlsx'],signature:zip}
};
function ole(b:Uint8Array){return Buffer.from(b.subarray(0,8)).equals(Buffer.from([208,207,17,224,161,177,26,225]));}
function zip(b:Uint8Array){return b[0]===80&&b[1]===75&&b[2]===3&&b[3]===4;}
export async function uploadMime(file:File):Promise<string|null>{const ext=file.name.split('.').pop()?.toLowerCase();if(!ext||!file.size||file.size>10*1024*1024)return null;
 const head=new Uint8Array(await file.slice(0,8).arrayBuffer());
 if(ext==='csv'&&['text/csv','text/plain','application/vnd.ms-excel','application/octet-stream',''].includes(file.type))return csv(new Uint8Array(await file.arrayBuffer()))?'text/csv':null;
 const mime=!file.type||file.type==='application/octet-stream'?Object.keys(types).find(k=>types[k].ext.includes(ext)):file.type;
 const t=mime?types[mime]:null;return t&&t.ext.includes(ext)&&t.signature(head)?mime!:null;
}
export async function validateUpload(file:File){return !!await uploadMime(file);}
