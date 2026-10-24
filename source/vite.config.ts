import vinext from 'vinext';
import {defineConfig} from 'vite';
// No API handlers or Cloudflare runtime code in the frontend build.
export default defineConfig(({command})=>{
 if(command==='build'){const value=process.env.VITE_API_URL;if(!value)throw new Error('VITE_API_URL required');const u=new URL(value);if(u.origin!==value||(!['https:'].includes(u.protocol)&&!(u.protocol==='http:'&&['localhost','127.0.0.1'].includes(u.hostname))))throw new Error('Invalid VITE_API_URL');}
 return {plugins:[vinext()],server:{host:'0.0.0.0'},build:{sourcemap:false}};
});
