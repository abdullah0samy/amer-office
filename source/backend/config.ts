export const env = process.env;
export function required(name:string):string {const value=env[name]?.trim();if(!value||value==='REPLACE')throw new Error(`Missing configuration: ${name}`);return value;}
export function validateConfig(){
 for(const name of ['DATABASE_URL','APP_ORIGIN','API_ORIGIN','OFFICE_OWNER_EMAIL','AUTH_SECRET','TAX_CREDENTIALS_KEY','R2_ENDPOINT','R2_BUCKET','R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY','SMTP_HOST','SMTP_PORT','SMTP_FROM'])required(name);
 if(required('AUTH_SECRET').length<32)throw new Error('Invalid configuration: AUTH_SECRET');
 if(!/^[a-f0-9]{64}$/.test(required('TAX_CREDENTIALS_KEY')))throw new Error('Invalid configuration: TAX_CREDENTIALS_KEY');
 for(const key of ['APP_ORIGIN','API_ORIGIN']){const u=new URL(required(key));if(u.origin!==env[key]|| (env.NODE_ENV==='production'&&u.protocol!=='https:'))throw new Error(`Invalid configuration: ${key}`);}
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(required('OFFICE_OWNER_EMAIL')))throw new Error('Invalid configuration: OFFICE_OWNER_EMAIL');
 if(!/^postgres(?:ql)?:/.test(required('DATABASE_URL')))throw new Error('Invalid configuration: DATABASE_URL');
 if(new URL(required('R2_ENDPOINT')).protocol!=='https:'&&env.NODE_ENV==='production')throw new Error('Invalid configuration: R2_ENDPOINT');
 if(!/^\d+$/.test(required('SMTP_PORT'))||Number(env.SMTP_PORT)<1||Number(env.SMTP_PORT)>65535)throw new Error('Invalid configuration: SMTP_PORT');
 if(env.SMTP_USER)required('SMTP_PASSWORD');
 if(env.SESSION_TTL_SECONDS&&(!/^\d+$/.test(env.SESSION_TTL_SECONDS)||Number(env.SESSION_TTL_SECONDS)<300||Number(env.SESSION_TTL_SECONDS)>86400))throw new Error('Invalid configuration: SESSION_TTL_SECONDS');
 if(env.DB_POOL_SIZE&&(!/^\d+$/.test(env.DB_POOL_SIZE)||Number(env.DB_POOL_SIZE)<1||Number(env.DB_POOL_SIZE)>100))throw new Error('Invalid configuration: DB_POOL_SIZE');
 if(env.NODE_ENV==='production'&&env.SMTP_REQUIRE_TLS!=='true')throw new Error('Production SMTP_REQUIRE_TLS must be true');
}
