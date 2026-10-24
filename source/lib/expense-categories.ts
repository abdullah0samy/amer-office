export const expenseGroups=[
 {name:'تكاليف الكوادر البشرية',items:['رواتب وأجور','التأمينات الاجتماعية — حصة صاحب العمل','الحوافز والمكافآت','التطوير المهني والدورات والشهادات']},
 {name:'تكاليف المقر والمرافق',items:['إيجار مقر المكتب','المرافق العامة — كهرباء ومياه وغاز','الاتصالات والإنترنت','النظافة والصيانة الدورية للمقر']},
 {name:'التكنولوجيا والاشتراكات البرمجية',items:['البرمجيات والأنظمة المحاسبية والمراجعة','الخدمات الرقمية والتوقيع والختم والتخزين السحابي','قواعد البيانات والمنصات المهنية']},
 {name:'الأدوات واللوازم المكتبية',items:['الأوراق والمطبوعات والأحبار وصيانة الطابعات','المستلزمات المكتبية والأرشفة والقرطاسية','الضيافة والبوفيه والاجتماعات']},
 {name:'الرسوم المهنية والاشتراكات الحكومية',items:['النقابات والجمعيات والسجلات المهنية','تراخيص النشاط والتجديدات المهنية']},
 {name:'التسويق وتطوير الأعمال',items:['الهوية والتواجد الرقمي واستضافة الموقع','المطبوعات الدعائية وكروت العمل وبروفايل المكتب']},
 {name:'التنقلات والمصروفات النثرية',items:['بدلات الانتقال وزيارات العملاء والمأموريات','المصاريف النثرية الطارئة والعهدة النقدية']},
] as const;
export const legacyExpenseCategories=['مصروفات إدارية','مصروفات تشغيل','رواتب','إيجار','انتقالات','أخرى'] as const;
export const payrollExpenseCategory=expenseGroups[0].name,payrollExpenseItem=expenseGroups[0].items[0];
export function expenseItems(category:string):readonly string[]{return expenseGroups.find(g=>g.name===category)?.items||[];}
export function validExpenseCategory(category:string){return expenseGroups.some(g=>g.name===category)||(legacyExpenseCategories as readonly string[]).includes(category);}
export function validExpenseClassification(category:string,item:string){const items=expenseItems(category);return items.length?items.includes(item):(legacyExpenseCategories as readonly string[]).includes(category)&&!item;}
export function expenseClassification(row:{category:string;subcategory?:string}){const mapped:Record<string,[string,string]>={'رواتب':[payrollExpenseCategory,payrollExpenseItem],'إيجار':[expenseGroups[1].name,expenseGroups[1].items[0]],'انتقالات':[expenseGroups[6].name,expenseGroups[6].items[0]]};return mapped[row.category]?{category:mapped[row.category][0],subcategory:mapped[row.category][1]}:{category:row.category,subcategory:row.subcategory||''};}
export function summarizeExpenses<T extends {category:string;subcategory?:string;amount:number}>(rows:T[]){const groups=new Map<string,{category:string;amount:number;count:number;items:Map<string,{name:string;amount:number;count:number}>}>();for(const g of expenseGroups)groups.set(g.name,{category:g.name,amount:0,count:0,items:new Map()});for(const r of rows){const c=expenseClassification(r);let group=groups.get(c.category);if(!group){group={category:c.category,amount:0,count:0,items:new Map()};groups.set(c.category,group)}group.amount+=r.amount;group.count++;const key=c.subcategory||'غير مفصل — تصنيف سابق',item=group.items.get(key)||{name:key,amount:0,count:0};item.amount+=r.amount;item.count++;group.items.set(key,item);}return [...groups.values()].map(g=>({...g,items:[...g.items.values()]}));}
