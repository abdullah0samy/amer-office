// Only the standalone names requested by the office are renamed.
// Specific offices such as جيزة ثان and مدينة نصر ثالث retain their names.
export function canonicalTaxOffice(value:string){const original=String(value||'').trim(),key=original.normalize('NFKC').replace(/[\u064B-\u065F\u0640\s]/g,'');if(['تالتورابع','تالتواربع','ثالثورابع','ثالث','تالت'].includes(key))return 'تالت و رابع';if(['ثان','تان','مهنحرهثان','مهنحرةثان'].includes(key))return 'مهن حره ثان';return original;}
