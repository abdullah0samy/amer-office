import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
await mkdir('dist-backend',{recursive:true});
await build({entryPoints:['backend/server.ts','backend/migrate.ts','backend/admin.ts','backend/import-data.ts','backend/verify-data.ts','backend/transfer-objects.ts','backend/import-office-templates.ts'],outdir:'dist-backend',bundle:true,platform:'node',target:'node24',format:'esm',packages:'external',sourcemap:false,tsconfig:'tsconfig.json'});
