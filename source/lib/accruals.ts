// Internal office costs. All values are integer piastres.
type Row=Record<string,any>;
export const accrualPhrase='تكلفة الإيراد المضاف';
export function normalizedRevenue(s:string){return String(s||'').normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/\s+/g,' ').trim();}
export function revenueCost(invoice:Row):number{
 let lines:Row[]=[];try{const v=typeof invoice.lineItems==='string'?JSON.parse(invoice.lineItems):invoice.lineItems;if(Array.isArray(v))lines=v;}catch{}
 const matches=(s:string)=>normalizedRevenue(s).includes('تكلفة الايراد المضاف');
 if(lines.length){const values=lines.map(l=>Math.round(Number(l.quantity)*Number(l.rate))),total=values.reduce((n,v)=>n+v,0),matched=values.reduce((n,v,i)=>n+(matches(lines[i].description)?v:0),0);
 // Matching service lines take priority over a general claim heading.
 if(!matched||total<=0)return matches(invoice.description)?Math.round(Number(invoice.amount)*30/100):0;const base=Number((BigInt(matched)*BigInt(invoice.amount)*BigInt(2)+BigInt(total))/(BigInt(2)*BigInt(total)));return Math.round(base*30/100);}
 return matches(invoice.description)?Math.round(Number(invoice.amount)*30/100):0;
}
export function accruedRows(invoices:Row[],manual:Row[],payments:Row[]):Row[]{const sources:Row[]=[...invoices.map(i=>({id:i.id,source:'invoice',description:i.description,clientId:i.clientId,amount:revenueCost(i),date:i.date,due:i.due})).filter(i=>i.amount>0),...manual.map(i=>({...i,source:'manual'}))];return sources.map(i=>{const paid=payments.filter(p=>i.source==='invoice'?p.invoiceId===i.id:p.accrualId===i.id).reduce((n,p)=>n+p.amount,0);return {...i,paid,remaining:i.amount-paid};});}
