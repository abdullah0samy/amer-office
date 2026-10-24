import {required} from './config';
import {scrypt as nativeScrypt,randomBytes,timingSafeEqual,createHmac} from 'node:crypto';
const params={N:32768,r:8,p:1,maxmem:64*1024*1024};
function derive(password:string,salt:string){return new Promise<Buffer>((resolve,reject)=>nativeScrypt(password,salt,64,params,(err,key)=>err?reject(err):resolve(key)));}
export async function hashPassword(password:string){if(password.length<12||password.length>256)throw new Error('Password must contain 12–256 characters');const salt=randomBytes(16).toString('hex');return `scrypt$32768$8$1$${salt}$${(await derive(password,salt)).toString('hex')}`;}
export async function checkPassword(password:string,stored:string){if(password.length>256)return false;const [algorithm,n,r,p,salt,hex]=stored.split('$');if(algorithm!=='scrypt'||n!=='32768'||r!=='8'||p!=='1'||!salt||!hex)return false;const key=await derive(password,salt),expected=Buffer.from(hex,'hex');return key.length===expected.length&&timingSafeEqual(key,expected);}
export const opaqueToken=()=>randomBytes(32).toString('base64url');
export function tokenHash(token:string){return createHmac('sha256',required('AUTH_SECRET')).update(token).digest('hex');}
