import {database} from '../db/raw';
import {hashPassword,checkPassword,opaqueToken,tokenHash} from './password';
import {authenticate,userByEmail,cookieName,audit} from '../lib/office-auth';
import {sendRecovery} from './mail';
import {z} from 'zod';
const email=z.string().trim().email().max(254).transform(s=>s.toLowerCase());
const invalid=()=>Response.json({error:'البريد الإلكتروني أو كلمة المرور غير صحيحة.'},{status:401});
export function sessionCookie(token:string,age:number){return `${cookieName()}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${process.env.NODE_ENV==='production'?'; Secure':''}`;}
export async function limited(key:string,limit:number,windowMs:number){const db=database(),now=Date.now(),window=Math.floor(now/windowMs),id=tokenHash(key+':'+window);const r=await db.prepare('INSERT INTO authRateLimits (id,count,expires) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET count=authRateLimits.count+1 RETURNING count').bind(id,new Date((window+2)*windowMs).toISOString()).first<{count:number}>();return (r?.count||0)>limit;}
export async function authRoute(req:Request){const url=new URL(req.url),path=url.pathname,db=database(),now=new Date().toISOString();
 if(path==='/api/auth/me'&&req.method==='GET')return Response.json({user:await authenticate(req)});
 if(req.method!=='POST')return new Response(null,{status:405});
 if(path==='/api/auth/logout'){const cookie=req.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith(cookieName()+'='))?.slice(cookieName().length+1);if(cookie)await db.prepare('DELETE FROM authSessions WHERE tokenHash=?').bind(tokenHash(cookie)).run();return Response.json({ok:true},{headers:{'Set-Cookie':sessionCookie('',0)}});}
 const b=await req.json() as any;
 if(path==='/api/auth/login'){
  const v=z.object({email,password:z.string().min(1).max(256)}).parse(b);
  
  const row=await db.prepare('SELECT passwordHash,verified FROM authCredentials WHERE email=?').bind(v.email).first<any>();
  // Fixed-cost dummy hash prevents fast missing-user timing. No default login password.
  const dummy='scrypt$32768$8$1$00000000000000000000000000000000$'+'00'.repeat(64);
  const valid=await checkPassword(v.password,row?.passwordHash||dummy),user=await userByEmail(v.email);
  if(!valid||!row?.verified||!user)return invalid();
  const token=opaqueToken(),seconds=Number(process.env.SESSION_TTL_SECONDS||28800);
  await db.prepare('INSERT INTO authSessions (tokenHash,email,expires,created) VALUES (?,?,?,?)').bind(tokenHash(token),v.email,new Date(Date.now()+seconds*1000).toISOString(),now).run();
  await audit(v.email,'تسجيل دخول').run();return Response.json({user},{headers:{'Set-Cookie':sessionCookie(token,seconds)}});
 }
 if(path==='/api/auth/recovery'){
  const v=z.object({email}).parse(b);
  if(await userByEmail(v.email)){const token=opaqueToken();await db.prepare('DELETE FROM authRecovery WHERE email=?').bind(v.email).run();await db.prepare('INSERT INTO authRecovery (tokenHash,email,expires,created) VALUES (?,?,?,?)').bind(tokenHash(token),v.email,new Date(Date.now()+1800000).toISOString(),now).run();try{await sendRecovery(v.email,token);}catch{console.error(JSON.stringify({event:'recovery_email_failed'}));await db.prepare('DELETE FROM authRecovery WHERE tokenHash=?').bind(tokenHash(token)).run();}}
  return Response.json({ok:true});
 }
 if(path==='/api/auth/reset'){
  const v=z.object({token:z.string().regex(/^[-\w]{43}$/),password:z.string().min(12).max(256)}).parse(b),hash=tokenHash(v.token);
  const row=await db.prepare('SELECT email FROM authRecovery WHERE tokenHash=? AND expires>?').bind(hash,now).first<{email:string}>();if(!row||!await userByEmail(row.email))return Response.json({error:'رابط غير صالح أو منتهي.'},{status:400});
  await db.prepare('INSERT INTO authCredentials (email,passwordHash,verified,created) VALUES (?,?,1,?) ON CONFLICT(email) DO UPDATE SET passwordHash=excluded.passwordHash,verified=1').bind(row.email,await hashPassword(v.password),now).run();
  await db.prepare('DELETE FROM authRecovery WHERE email=?').bind(row.email).run();await db.prepare('DELETE FROM authSessions WHERE email=?').bind(row.email).run();await audit(row.email,'تفعيل أو استعادة الحساب').run();return Response.json({ok:true});
 }
 return new Response(null,{status:404});
}
