import {pool} from '../db/raw';
import {readExport,importData} from './data-tools';
try{if(process.argv[2]!=='--approved-empty-target'||!process.argv[3])throw new Error('Usage: import-data --approved-empty-target /private/export.json');const tables=await readExport(process.argv[3]),c=await pool.connect();try{console.log(JSON.stringify({event:'import_verified',tables:await importData(c,tables)}));}finally{c.release();}}catch(e){console.error(JSON.stringify({event:'import_failed',message:e instanceof Error?e.message:'error'}));process.exitCode=1;}finally{await pool.end();}
