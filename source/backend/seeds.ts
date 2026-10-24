import {readFileSync} from 'node:fs';
import {z} from 'zod';
import {inspectionSchema} from '../lib/inspections';
// Private input mounted separately, never baked into image or repository.
const seed=z.object({key:z.string().min(1),tax:z.string().regex(/^\d{9}$/),staffCode:z.string(),data:inspectionSchema}).passthrough();
let cached:any[]|undefined;
export function loadInspectionSeeds():any[]{if(cached)return cached;if(!process.env.INSPECTION_SEEDS_PATH)return [];return cached=z.array(seed).parse(JSON.parse(readFileSync(process.env.INSPECTION_SEEDS_PATH,'utf8')));}
