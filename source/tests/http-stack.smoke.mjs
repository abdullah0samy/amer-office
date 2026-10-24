import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomBytes} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {PGLiteSocketServer} from '@electric-sql/pglite-socket';
import {SMTPServer} from 'smtp-server';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function waitReady(url,p){for(let i=0;i<100;i++){if(p.exitCode!==null)throw new Error('Server exited');try{if((await fetch(url)).ok)return;}catch{}await pause(100);}throw new Error('Server readiness timeout');}
async function exit(p){if(!p||p.exitCode!==null)return;p.kill('SIGTERM');for(let i=0;i<100;i++){if(p.exitCode!==null){assert.equal(p.exitCode,0,'Graceful shutdown');return;}await pause(100);}p.kill('SIGKILL');throw new Error('Graceful shutdown timed out');}
async function command(file,env,input){const p=spawn(process.execPath,[file,...(input?.args||[])],{env,stdio:['pipe','pipe','pipe']});let output='';p.stdout.on('data',c=>output+=c);p.stderr.on('data',c=>output+=c);p.stdin.end(input?.stdin);const code=await new Promise(r=>p.on('exit',r));assert.equal(code,0,'CLI failed: '+output);return output;}
function messageText(raw){return /Content-Transfer-Encoding: base64/i.test(raw)?Buffer.from(raw.split(/\r?\n\r?\n/).slice(1).join(''),'base64').toString():raw.replace(/=\r?\n/g,'').replace(/=3D/g,'=');}
test('compiled HTTP API + pg wire protocol + private S3 + SMTP + durable restart',{timeout:90000},async()=>{
 const root=await mkdtemp(join(tmpdir(),'amer-http-stack-')),objects=new Map(),emails=[];let database,socket,backend,smtp,s3;let logs='';
 try{
  s3=createServer(async(req,res)=>{const key=new URL(req.url,'http://test').pathname;if(req.method==='PUT'){const chunks=[];for await(const c of req)chunks.push(c);objects.set(key,{body:Buffer.concat(chunks),mime:req.headers['content-type']});res.writeHead(200,{ETag:'"test"'});res.end();}else if(req.method==='GET'){const o=objects.get(key);if(o){res.writeHead(200,{'Content-Type':o.mime,'Content-Length':o.body.length});res.end(o.body);}else{res.writeHead(404,{'Content-Type':'application/xml'});res.end('<Error><Code>NoSuchKey</Code></Error>');}}else if(req.method==='DELETE'){objects.delete(key);res.writeHead(204);res.end();}else{res.writeHead(405);res.end();}});
  await new Promise(r=>s3.listen(0,'127.0.0.1',r));
  smtp=new SMTPServer({disabledCommands:['AUTH','STARTTLS'],onData(stream,session,callback){let s='';stream.on('data',c=>s+=c);stream.on('end',()=>{emails.push(s);callback();});}});await new Promise(r=>smtp.listen(0,'127.0.0.1',r));
  async function startDatabase(){database=new PGlite(join(root,'postgres-data'));await database.waitReady;socket=new PGLiteSocketServer({db:database,port:0,host:'127.0.0.1'});await socket.start();return 'postgresql://postgres@'+socket.getServerConn()+'/postgres?sslmode=disable';}
  const env={...process.env,NODE_ENV:'test',PORT:'3401',DATABASE_URL:await startDatabase(),DB_POOL_SIZE:'1',APP_ORIGIN:'http://localhost:3400',API_ORIGIN:'http://127.0.0.1:3401',OFFICE_OWNER_EMAIL:'owner@example.test',AUTH_SECRET:randomBytes(32).toString('hex'),TAX_CREDENTIALS_KEY:randomBytes(32).toString('hex'),R2_ENDPOINT:`http://127.0.0.1:${s3.address().port}`,R2_BUCKET:'synthetic-http-test',R2_ACCESS_KEY_ID:'synthetic',R2_SECRET_ACCESS_KEY:'synthetic',R2_FORCE_PATH_STYLE:'true',SMTP_HOST:'127.0.0.1',SMTP_PORT:String(smtp.server.address().port),SMTP_FROM:'office@example.test',SMTP_REQUIRE_TLS:'false',SMTP_SECURE:'false'};
  await command('dist-backend/migrate.js',env);await command('dist-backend/migrate.js',env);
  await command('dist-backend/admin.js',env,{args:['owner@example.test'],stdin:'Synthetic-HTTP-password-2026'});
  const startBackend=async()=>{backend=spawn(process.execPath,['dist-backend/server.js'],{env,stdio:['ignore','pipe','pipe']});backend.stdout.on('data',c=>logs+=c);backend.stderr.on('data',c=>logs+=c);await waitReady(env.API_ORIGIN+'/health',backend);};
  await startBackend();let ownerCookie='';
  async function api(path,method='GET',body,cookie=ownerCookie,origin=env.APP_ORIGIN){return fetch(env.API_ORIGIN+path,{method,headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...(body===undefined||body instanceof FormData?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:body instanceof FormData?body:JSON.stringify(body)});}
  let r=await api('/api/auth/login','POST',{email:'owner@example.test',password:'wrong'},'');assert.equal(r.status,401);
  r=await api('/api/auth/login','POST',{email:'owner@example.test',password:'Synthetic-HTTP-password-2026'},'');assert.equal(r.status,200);ownerCookie=r.headers.get('set-cookie').split(';')[0];
  assert.equal((await api('/api/records','GET',undefined,'')).status,401);assert.equal((await api('/api/records','GET',undefined,ownerCookie,'https://wrong.example')).status,403);
  const payload={name:'Synthetic HTTP Client',activity:'test',taxOffice:'ثالث',taxFile:'',portalEmail:'',nationalId:'',tax:'123456789',registration:'',phone:'',email:'',address:'',notes:'',status:'نشط'};
  r=await api('/api/records','POST',{kind:'clients',data:payload});assert.equal(r.status,200);const clientId=(await r.json()).id;
  r=await api('/api/records','POST',{kind:'invoices',data:{clientId,description:'Synthetic HTTP invoice',amount:100000,date:'2026-10-24',due:'2026-11-01'}});assert.equal(r.status,200);const invoiceId=(await r.json()).id;
  assert.equal((await api('/api/records','POST',{kind:'payments',data:{invoiceId,amount:25000,date:'2026-10-24',method:'نقدي',reference:''}})).status,200);
  const form=new FormData();form.set('clientId',clientId);form.set('file',new File(['%PDF-1.4 HTTP fixture'],'http.pdf',{type:'application/pdf'}));r=await api('/api/documents','POST',form);assert.equal(r.status,200);const fileId=(await r.json()).id;assert.equal(await (await api('/api/documents?id='+fileId)).text(),'%PDF-1.4 HTTP fixture');assert.equal((await api('/api/documents?id='+fileId,'GET',undefined,'')).status,401);
  r=await api('/api/records','POST',{kind:'staff',data:{code:'SYN',name:'Synthetic HTTP Employee',role:'Accountant',phone:'',email:'employee@example.test'}});assert.equal(r.status,200);const staffId=(await r.json()).id;
  assert.equal((await api('/api/access','POST',{kind:'account',data:{email:'employee@example.test',staffId,accessRole:'employee',active:true}})).status,200);
  assert.equal((await api('/api/auth/recovery','POST',{email:'employee@example.test'},'')).status,200);assert.equal(emails.length,1);const token=messageText(emails[0]).match(/token=([\w-]{43})/)[1];assert.equal((await api('/api/auth/reset','POST',{token,password:'Synthetic-worker-password-2026'},'')).status,200);
  r=await api('/api/auth/login','POST',{email:'employee@example.test',password:'Synthetic-worker-password-2026'},'');assert.equal(r.status,200);const employeeCookie=r.headers.get('set-cookie').split(';')[0];
  assert.equal((await api('/api/records','POST',{kind:'clients',data:payload},employeeCookie)).status,403);assert.equal((await api('/api/documents?id='+fileId,'GET',undefined,employeeCookie)).status,403);
  assert.equal((await api('/api/access','POST',{kind:'assignment',data:{clientId,staffId}})).status,200);assert.equal((await api('/api/documents?id='+fileId,'GET',undefined,employeeCookie)).status,200);
  const before=await (await api('/api/records')).json();assert.equal(before.invoices[0].amount,100000);assert.equal(before.payments[0].amount,25000);
  await exit(backend);await socket.stop();await database.close();env.DATABASE_URL=await startDatabase();await startBackend();
  const recovered=await api('/api/records');assert.equal(recovered.status,200);const restored=await recovered.json();assert.equal(restored.clients[0].id,clientId);assert.equal(restored.payments[0].amount,25000);assert.equal((await api('/api/documents?id='+fileId)).status,200);
  assert.equal((await api('/api/auth/logout','POST')).status,200);assert.equal((await api('/api/records')).status,401);
  assert.ok(!logs.includes('Synthetic-HTTP-password-2026'));assert.ok(!logs.includes('Synthetic-worker-password-2026'));
 }finally{await exit(backend);if(socket)await socket.stop();if(database)await database.close();if(smtp)await new Promise(r=>smtp.close(r));if(s3)await new Promise(r=>s3.close(r));await rm(root,{recursive:true,force:true});}
});
