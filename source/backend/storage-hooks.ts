import {AsyncLocalStorage} from 'node:async_hooks';
export const storageRollback=new AsyncLocalStorage<Array<()=>Promise<unknown>>>();
export function onStorageRollback(fn:()=>Promise<unknown>){storageRollback.getStore()?.push(fn);}
