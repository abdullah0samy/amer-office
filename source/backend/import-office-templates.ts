import {pool} from '../db/raw';
import {importOfficeTemplates} from './template-import';
try{if(!process.argv[2])throw new Error('Usage: import-office-templates /private/bundle-directory');console.log(JSON.stringify({event:'private_templates_imported',...await importOfficeTemplates(process.argv[2])}));}catch(e){console.error(JSON.stringify({event:'private_template_import_failed',message:e instanceof Error?e.message:'error'}));process.exitCode=1;}finally{await pool.end();}
