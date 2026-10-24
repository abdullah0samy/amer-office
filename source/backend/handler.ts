import {businessTransaction,pool} from '../db/raw';
import {authRoute,limited} from './auth';
import {accessResponse} from '../lib/office-auth';
import {z} from 'zod';
import * as records from './routes/records/route';
import * as access from './routes/access/route';
import * as accruals from './routes/accruals/route';
import * as dossier from './routes/client-dossier/route';
import * as profile from './routes/client-profile/route';
import * as documents from './routes/documents/route';
import * as importing from './routes/import/route';
import * as income from './routes/income/route';
import * as inspections from './routes/inspections/route';
import * as templates from './routes/office-templates/route';
import * as payroll from './routes/payroll/route';
import * as tax from './routes/tax/route';
import * as vat from './routes/vat/route';
const routes:Record<string,Record<string,any>>={'records':records,'access':access,'accruals':accruals,'client-dossier':dossier,'client-profile':profile,'documents':documents,'import':importing,'income':income,'inspections':inspections,'office-templates':templates,'payroll':payroll,'tax':tax,'vat':vat};
export async function handle(req:Request,remoteAddress='unknown'):Promise<Response>{
 const start=performance.now(),id=crypto.randomUUID(),url=new URL(req.url),origin=req.headers.get('origin');let result:Response;
 try{
 if(url.pathname==='/health'&&req.method==='GET'){try{await pool.query('SELECT 1');const r=await pool.query('SELECT count(*)::int AS n FROM office_schema_migrations');result=Response.json({status:r.rows[0].n>=3?'ok':'not_ready'},{status:r.rows[0].n>=3?200:503});}catch{result=Response.json({status:'not_ready'},{status:503});}}
 else if(url.pathname==='/live'&&req.method==='GET')result=Response.json({status:'ok'});
 else if(origin&&origin!==process.env.APP_ORIGIN)result=Response.json({error:'Origin not allowed'},{status:403});
 else if(req.method==='OPTIONS')result=new Response(null,{status:204});
 else if(!['GET','HEAD'].includes(req.method)&&origin!==process.env.APP_ORIGIN)result=Response.json({error:'طلب غير مسموح'},{status:403});
 else {
 const isAuth=url.pathname.startsWith('/api/auth/');
 let throttled=false;
 if(isAuth&&req.method==='POST'){
 throttled=await limited('ip:'+remoteAddress,50,15*60000);
 if(['/api/auth/login','/api/auth/recovery'].includes(url.pathname)){try{const b=await req.clone().json() as any;if(typeof b.email==='string'&&b.email.length<=254)throttled=await limited(url.pathname+':'+b.email.trim().toLowerCase(),url.pathname.endsWith('recovery')?3:10,url.pathname.endsWith('recovery')?3600000:900000)||throttled;}catch{}}
 }
 result=throttled?Response.json({error:'محاولات كثيرة. حاول لاحقًا.'},{status:429}):await businessTransaction(async()=>{
 if(isAuth)return authRoute(req);
 const match=url.pathname.match(/^\/api\/([a-z-]+)$/),route=match&&routes[match[1]],fn=route?.[req.method];
 return typeof fn==='function'?fn(req):new Response(null,{status:route?405:404});
 },!['GET','HEAD'].includes(req.method));
 }
 }catch(e){result=accessResponse(e)||(e instanceof z.ZodError?Response.json({error:'بيانات غير صحيحة'},{status:400}):Response.json({error:'تعذر إتمام الطلب'},{status:503}));console.error(JSON.stringify({event:'request_error',requestId:id,path:url.pathname,errorCode:e instanceof z.ZodError?'validation':(e as any)?.code||'application_error'}));}
 const h=new Headers(result.headers);h.set('X-Request-ID',id);h.set('Cache-Control','private, no-store');h.set('X-Content-Type-Options','nosniff');h.set('Referrer-Policy','no-referrer');h.set('Vary','Origin');
 if(origin===process.env.APP_ORIGIN){h.set('Access-Control-Allow-Origin',origin);h.set('Access-Control-Allow-Credentials','true');h.set('Access-Control-Allow-Methods','GET, POST, PUT, PATCH, DELETE, OPTIONS');h.set('Access-Control-Allow-Headers','Content-Type');h.set('Access-Control-Expose-Headers','Content-Disposition, X-Request-ID');}
 console.log(JSON.stringify({event:'request',requestId:id,method:req.method,path:url.pathname,status:result.status,durationMs:Math.round(performance.now()-start)}));
 return new Response(result.body,{status:result.status,headers:h});
}
