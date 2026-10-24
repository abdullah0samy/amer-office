import {z} from 'zod';
import {canonicalTaxOffice} from './tax-offices';
export const profileGroups=[
 {label:'الكيان والبيانات الأساسية',fields:[['legalEntity','الكيان القانوني'],['managerName','اسم الممول / المدير'],['taxpayerCode','كود الممول']]},
 {label:'الفاتورة الإلكترونية',fields:[['eInvoiceUsername','اسم المستخدم'],['eInvoiceIssued','تاريخ الإصدار','date'],['eInvoiceExpires','تاريخ الانتهاء','date']]},
 {label:'بوابة الضرائب المصرية',fields:[['taxPortalUsername','يوزر بوابة الضرائب المصرية']]},
 {label:'منظومة الأجور والمرتبات',fields:[['payrollUsername','يوزر منظومة الأجور والمرتبات']]},
 {label:'المنظومة القديمة',fields:[['oldUsername','اسم المستخدم'],['oldEmail','البريد الإلكتروني','email'],['oldPhone','التليفون']]},
 {label:'المنظومة الجديدة',fields:[['newUsername','اسم المستخدم'],['newType','نوع الحساب / المنظومة'],['newEmail','البريد الإلكتروني','email'],['newPhone','التليفون']]},
 {label:'الدفاتر',fields:[['legalBooks','موقف الدفاتر القانونية'],['accountingBooks','موقف الدفاتر المحاسبية']]},
 {label:'السجل التجاري',fields:[['commercialOffice','مكتب السجل التجاري'],['activityStart','تاريخ بداية النشاط','date'],['commercialIssued','تاريخ إصدار السجل','date'],['commercialExpires','تاريخ انتهاء السجل','date']]},
 {label:'البطاقة الضريبية',fields:[['taxCardIssued','تاريخ الإصدار','date'],['taxCardExpires','تاريخ الانتهاء','date']]},
 {label:'شهادة القيمة المضافة',fields:[['vatOffice','المأمورية التابعة للقيمة المضافة'],['vatIssued','تاريخ الإصدار','date'],['vatExpires','تاريخ الانتهاء','date']]},
 {label:'سجل المصدرين',fields:[['exportNo','رقم السجل'],['exportIssued','تاريخ الإصدار','date'],['exportExpires','تاريخ الانتهاء','date']]},
 {label:'سجل المستوردين',fields:[['importNo','رقم السجل'],['importIssued','تاريخ الإصدار','date'],['importExpires','تاريخ الانتهاء','date']]},
] as const;
export const clientLoginSystems=[{title:'منظومة الفاتورة الإلكترونية',username:'eInvoiceUsername',password:'eInvoicePassword'},{title:'بوابة الضرائب المصرية',username:'taxPortalUsername',password:'taxPortalPassword'},{title:'منظومة الأجور والمرتبات',username:'payrollUsername',password:'payrollPassword'}] as const;
export const profileSecretFields={eInvoicePassword:'باسورد منظومة الفاتورة الإلكترونية',taxPortalPassword:'باسورد بوابة الضرائب المصرية',tokenPassword:'كلمة مرور التوكن',oldPassword:'كلمة مرور المنظومة القديمة',payrollPassword:'باسورد منظومة الأجور والمرتبات',oldEmailPassword:'كلمة مرور بريد المنظومة القديمة',newPassword:'كلمة مرور المنظومة الجديدة',newEmailPassword:'كلمة مرور بريد المنظومة الجديدة'} as const;
const date=z.union([z.literal(''),z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v)]),text=z.string().trim().max(500),email=text.refine(v=>!v||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
const fields:Record<string,z.ZodType<string>>={};for(const group of profileGroups)for(const f of group.fields){const type=(f as readonly string[])[2];fields[f[0]]=(type==='date'?date:type==='email'?email:text).default('');}
export const clientProfileSchema=z.object(fields).strict().superRefine((d,ctx)=>{for(const [issue,end]of [['eInvoiceIssued','eInvoiceExpires'],['commercialIssued','commercialExpires'],['taxCardIssued','taxCardExpires'],['vatIssued','vatExpires'],['exportIssued','exportExpires'],['importIssued','importExpires']])if(d[issue]&&d[end]&&d[end]<d[issue])ctx.addIssue({code:'custom',message:'تاريخ الانتهاء يسبق الإصدار.'});});
export function emptyClientProfile():Record<string,string>{return Object.fromEntries(profileGroups.flatMap(g=>g.fields.map(f=>[f[0],''])));}
export function officeKey(value:string){let s=canonicalTaxOffice(value).normalize('NFKC').replace(/[\u064B-\u065F\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/\s+/g,' ').trim().replace(/^ماموريه\s+/,'');if(/^جيزه (تان|تاني|ثان|ثاني|ثانيه)$/.test(s))s='جيزه ثان';if(/^جيزه (اول|اولي)$/.test(s))s='جيزه اول';return s.replace(/^الهرم$/,'هرم')||'غير محددة';}
export function officeOptions<T extends {taxOffice?:string}>(clients:T[]){const map=new Map<string,{key:string;label:string;count:number;aliases:Set<string>}>();for(const c of clients){const raw=c.taxOffice?.trim()||'غير محددة',key=officeKey(raw);const group=map.get(key)||{key,label:raw,count:0,aliases:new Set<string>()};const labels:Record<string,string>={'هرم':'الهرم','جيزه اول':'جيزة أول','جيزه ثان':'جيزة ثان','تالت و رابع':'تالت و رابع','مهن حره ثان':'مهن حره ثان'};group.label=labels[key]||group.label;group.count++;group.aliases.add(raw);map.set(key,group);}return [...map.values()].map(v=>({...v,aliases:[...v.aliases]})).sort((a,b)=>a.label.localeCompare(b.label,'ar'));}
