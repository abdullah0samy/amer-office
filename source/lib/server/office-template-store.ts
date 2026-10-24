import files from './office-template-files.json';
import images from './office-template-images.json';
import {database,bucket} from '@/db/raw';
import {type OfficeTemplate,type TemplateAsset} from '@/lib/office-template-upload';
const imageGroups:Record<string,any[]>=images;
export function builtInTemplates():OfficeTemplate[]{return files.map(f=>({...f,pages:imageGroups[f.id]||[]}));}
export async function allTemplates(){const rows=await database().prepare('SELECT data FROM officeTemplates ORDER BY created DESC').all<{data:string}>();return [...builtInTemplates(),...rows.results.map(r=>JSON.parse(r.data) as OfficeTemplate)];}
export async function assetBytes(asset:TemplateAsset){if(asset.base64)return Uint8Array.from(atob(asset.base64),c=>c.charCodeAt(0));if(!asset.key||!/^office-templates\/[a-f0-9-]{36}\/[a-f0-9-]{36}\/(word\.docx|page-\d+\.jpg)$/.test(asset.key))throw new Error('TEMPLATE_ASSET_UNAVAILABLE');const object=await bucket().get(asset.key);if(!object)throw new Error('TEMPLATE_ASSET_UNAVAILABLE');return new Uint8Array(await object.arrayBuffer());}
export function publicTemplate(t:OfficeTemplate){const {base64,key,pages,...meta}=t;return {...meta,pageCount:pages.length,pages:pages.map(({key,base64,...p})=>p)};}
