import {pool} from '../db/raw';
import {readExport,verifyData} from './data-tools';
try{const tables=await readExport(process.argv[2]),c=await pool.connect();try{await c.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');console.log(JSON.stringify({event:'verification_passed',tables:await verifyData(c,tables)}));await c.query('COMMIT');}finally{c.release();}}catch(e){console.error(JSON.stringify({event:'verification_failed',message:e instanceof Error?e.message:'error'}));process.exitCode=1;}finally{await pool.end();}
