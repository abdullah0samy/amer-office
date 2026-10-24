import {pool} from '../db/raw';
import {storage} from './storage';
export async function cleanup(){
 const c=await pool.connect();try{await c.query('BEGIN');const locked=await c.query('SELECT pg_try_advisory_xact_lock(709412033) AS locked');if(!locked.rows[0].locked){await c.query('ROLLBACK');return;}
 const rows=await c.query('SELECT key FROM "storageDeletions" ORDER BY created LIMIT 20 FOR UPDATE SKIP LOCKED');
 for(const row of rows.rows)try{await storage.delete(row.key);await c.query('DELETE FROM "storageDeletions" WHERE key=$1',[row.key]);}catch{await c.query('UPDATE "storageDeletions" SET attempts=attempts+1 WHERE key=$1',[row.key]);console.error(JSON.stringify({event:'storage_delete_retry'}));}
 for(const table of ['authSessions','authRecovery','authRateLimits'])await c.query(`DELETE FROM "${table}" WHERE expires<$1`,[new Date().toISOString()]);
 await c.query('COMMIT');}catch{await c.query('ROLLBACK');console.error(JSON.stringify({event:'cleanup_failed'}));}finally{c.release();}
}
