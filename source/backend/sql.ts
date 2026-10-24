import names from '../db/identifiers.json';
const identifiers=new Set(names);
/** Lex tokens rather than substituting inside literals, comments or quoted identifiers. */
export function postgresSQL(sql:string):string {
 let i=0,n=0,out='';
 while(i<sql.length){const c=sql[i];
  if(c==="'"||c==='"'||c==='`'){const q=c;let token=c;i++;while(i<sql.length){const x=sql[i++];token+=x;if(x===q){if(sql[i]===q){token+=sql[i++];continue;}break;}}out+=q==='`'?'"'+token.slice(1,-1).replaceAll('"','""')+'"':token;continue;}
  if(sql.slice(i,i+2)==='--'){const end=sql.indexOf('\n',i);if(end<0){out+=sql.slice(i);break;}out+=sql.slice(i,end);i=end;continue;}
  if(sql.slice(i,i+2)==='/*'){const end=sql.indexOf('*/',i+2);if(end<0)throw new Error('Unclosed SQL comment');out+=sql.slice(i,end+2);i=end+2;continue;}
  if(c==='?'){out+='$'+(++n);i++;continue;}
  const m=sql.slice(i).match(/^[A-Za-z_][A-Za-z_0-9]*/);if(m){const v=m[0];out+=identifiers.has(v)?'"'+v+'"':v;i+=v.length;continue;}
  out+=c;i++;
 }
 return out;
}
