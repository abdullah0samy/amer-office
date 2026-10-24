const base=import.meta.env.VITE_API_URL as string;
if(!base)throw new Error('VITE_API_URL is required at frontend build time');
export function apiUrl(path:string){return new URL(path,base).href;}
export function apiFetch(input:RequestInfo|URL,init:RequestInit={}){const url=typeof input==='string'&&input.startsWith('/api/')?apiUrl(input):input;return globalThis.fetch(url,{...init,credentials:'include'});}
