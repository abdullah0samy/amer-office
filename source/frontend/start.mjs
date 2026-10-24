import {startProdServer} from 'vinext/server/prod-server';
// Vinext's Node production server serves the existing App Router UI and assets.
// Backend routes are excluded from frontend app/ tree by the build preparation step.
await startProdServer({port:Number(process.env.PORT||3000),host:'0.0.0.0',outDir:new URL('../dist',import.meta.url).pathname});
