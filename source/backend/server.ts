import {createServer} from 'node:http';
import {Readable} from 'node:stream';
import {handle} from './handler';
import {validateConfig} from './config';
import {pool} from '../db/raw';
import {cleanup} from './cleanup';
try{validateConfig();}catch(e){console.error(JSON.stringify({event:'configuration_error',message:e instanceof Error?e.message:'invalid configuration'}));process.exit(1);}
const server=createServer(async(req,res)=>{
 try{
 const maxBody=req.url?.split('?')[0]==='/api/office-templates'?32*1024*1024+65536:12*1024*1024;const body:Buffer[]=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>maxBody){res.writeHead(413);res.end();req.destroy();return;}body.push(chunk);}
 const headers=new Headers();for(const [name,value]of Object.entries(req.headers)){if(name.startsWith('oai-')||name.startsWith('x-forwarded-')||name==='host'||name==='content-length')continue;if(value)headers.set(name,Array.isArray(value)?value.join(','):value);}
 const request=new Request(new URL(req.url||'/',process.env.API_ORIGIN),{method:req.method,headers,body:['GET','HEAD'].includes(req.method||'GET')?undefined:Buffer.concat(body)});
 const response=await handle(request,req.socket.remoteAddress);const h:Record<string,string|string[]>={};response.headers.forEach((v,k)=>{if(k!=='set-cookie')h[k]=v;});const cookies=response.headers.getSetCookie();if(cookies.length)h['set-cookie']=cookies;
 res.writeHead(response.status,h);if(response.body){const stream=Readable.fromWeb(response.body as any);stream.on('error',()=>res.destroy());stream.pipe(res);}else res.end();
 }catch{if(!res.headersSent)res.writeHead(500);res.end();}
});
server.requestTimeout=60000;server.headersTimeout=15000;server.keepAliveTimeout=5000;
server.listen(Number(process.env.PORT||3001),'0.0.0.0',()=>console.log(JSON.stringify({event:'listening',port:Number(process.env.PORT||3001)})));
const timer=setInterval(()=>void cleanup(),60000);timer.unref();let closing=false;
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{if(closing)return;closing=true;clearInterval(timer);server.close(async()=>{await pool.end();process.exit(0);});setTimeout(()=>process.exit(1),25000).unref();});
