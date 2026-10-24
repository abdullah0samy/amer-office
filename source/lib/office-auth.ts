import {database} from '@/db/raw';
import {tokenHash} from '@/backend/password';
export type OfficeUser={email:string;name:string;role:'owner'|'manager'|'employee';staffId:string|null};
export class AccessError extends Error{status:number;constructor(message:string,status=403){super(message);this.status=status;}}
export const cookieName=()=>process.env.NODE_ENV==='production'?'__Host-office_session':'office_session';
export function sameOrigin(req:Request){if(req.headers.get('origin')!==process.env.APP_ORIGIN)throw new AccessError('طلب غير مسموح');}
export async function userByEmail(email:string):Promise<OfficeUser|null>{if(email===(process.env.OFFICE_OWNER_EMAIL||'').trim().toLowerCase())return {email,name:'عامر رشاد',role:'owner',staffId:null};const row=await database().prepare('SELECT a.*,s.name FROM accessUsers a JOIN staff s ON s.id=a.staffId WHERE a.email=? AND a.active=1').bind(email).first<any>();if(!row)return null;return {email,name:row.name,role:row.accessRole==='manager'?'manager':'employee',staffId:row.staffId};}
export async function authenticate(req:Request):Promise<OfficeUser>{const token=req.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName()+'='))?.slice(cookieName().length+1);if(!token||!/^[-\w]{43}$/.test(token))throw new AccessError('يلزم تسجيل الدخول بحساب المكتب.',401);const row=await database().prepare('SELECT email FROM authSessions WHERE tokenHash=? AND expires>?').bind(tokenHash(token),new Date().toISOString()).first<{email:string}>();if(!row)throw new AccessError('انتهت جلسة الدخول.',401);const user=await userByEmail(row.email);if(!user)throw new AccessError('هذا الحساب غير مفعّل لدى المكتب.');return user;}
export function management(u:OfficeUser){if(u.role==='employee')throw new AccessError('هذه العملية متاحة للإدارة فقط.');}
export function ownerOnly(u:OfficeUser){if(u.role!=='owner')throw new AccessError('إدارة الدخول والصلاحيات متاحة لصاحب النظام فقط.');}
export async function clientAllowed(u:OfficeUser,clientId:string){if(u.role!=='employee')return true;return !!await database().prepare('SELECT id FROM assignments WHERE clientId=? AND staffId=? UNION SELECT id FROM tasks WHERE clientId=? AND staffId=? LIMIT 1').bind(clientId,u.staffId,clientId,u.staffId).first();}
export async function demandClient(u:OfficeUser,clientId:string){if(!await clientAllowed(u,clientId))throw new AccessError('هذا العميل غير مسند إليك.');}
export function accessResponse(e:unknown){if(e instanceof AccessError)return Response.json({error:e.message},{status:e.status});return null;}
export function audit(actor:string,action:string){return database().prepare('INSERT INTO securityLog (id,actor,action,created) VALUES (?,?,?,?)').bind(crypto.randomUUID(),actor,action,new Date().toISOString());}
