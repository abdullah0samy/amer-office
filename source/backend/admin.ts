import {pool} from '../db/raw';
import {hashPassword} from './password';
import {userByEmail} from '../lib/office-auth';
const email=process.argv[2]?.toLowerCase().trim();
try{if(!email||!await userByEmail(email))throw new Error('Email must be configured owner or active staff account');
 if(process.stdin.isTTY)throw new Error('Read password securely and pipe to stdin; never pass a password as argument');
 let input='';for await(const chunk of process.stdin){input+=chunk;if(input.length>512)throw new Error('Invalid password length');}
 const hash=await hashPassword(input.replace(/\r?\n$/,''));const client=await pool.connect();try{await client.query('BEGIN');await client.query('INSERT INTO "authCredentials" (email,"passwordHash",verified,created) VALUES ($1,$2,1,$3) ON CONFLICT(email) DO UPDATE SET "passwordHash"=excluded."passwordHash",verified=1',[email,hash,new Date().toISOString()]);await client.query('DELETE FROM "authSessions" WHERE email=$1',[email]);await client.query('COMMIT');}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}console.log('Account provisioned; existing sessions revoked');
}catch(e){console.error(e instanceof Error?e.message:'Provision failed');process.exitCode=1;}finally{await pool.end();}
