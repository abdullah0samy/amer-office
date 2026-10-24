export const officeBrand={logo:'/brand/office-logo.jpeg',stamp:'/brand/office-stamp.jpeg',title:'المدير التنفيذي',name:'عامر رشاد محمد',profession:'محاسب ومراجع قانوني - خبير ضرائب'} as const;
export type BrandImages={logo:CanvasImageSource;stamp:CanvasImageSource};
let images:Promise<BrandImages>|undefined;
export function loadBrandImages(){return images||=(Promise.all([officeBrand.logo,officeBrand.stamp].map(src=>new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('تعذر تحميل اللوجو أو الختم. أعد فتح المطالبة.'));image.src=src;}))).then(([logo,stamp])=>({logo,stamp})).catch(e=>{images=undefined;throw e;}));}
