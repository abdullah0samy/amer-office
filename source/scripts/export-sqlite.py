#!/usr/bin/env python3
"""Offline authorized D1 export converter. Never contacts production."""
import argparse,sqlite3,json,hashlib,pathlib
p=argparse.ArgumentParser();p.add_argument('input');p.add_argument('output');p.add_argument('--sql-dump',action='store_true');a=p.parse_args()
if a.sql_dump:
 db=sqlite3.connect(':memory:')
 def authorize(op,arg1,arg2,db_name,trigger):
  if op in (sqlite3.SQLITE_ATTACH,sqlite3.SQLITE_DETACH):return sqlite3.SQLITE_DENY
  if op==sqlite3.SQLITE_FUNCTION and str(arg2).lower() in ('load_extension','writefile','readfile'):return sqlite3.SQLITE_DENY
  return sqlite3.SQLITE_OK
 db.set_authorizer(authorize);db.executescript(pathlib.Path(a.input).read_text())
else:db=sqlite3.connect(pathlib.Path(a.input).resolve().as_uri()+'?mode=ro',uri=True)
if db.execute('PRAGMA foreign_key_check').fetchall():raise SystemExit('Source has foreign-key violations')
schema=json.loads((pathlib.Path(__file__).parent.parent/'db/schema.json').read_text())
actual_tables={r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table'")}
unknown={t for t in actual_tables if t not in schema and not t.startswith(('sqlite_','_cf_')) and t not in ('d1_migrations','__drizzle_migrations')}
if unknown:raise SystemExit('Unexpected source tables require explicit review: '+','.join(sorted(unknown)))
out={'version':1,'tables':{}}
for table,columns in schema.items():
 actual=[r[1] for r in db.execute('PRAGMA table_info("'+table+'")')]
 if set(actual)!={c['name'] for c in columns}:raise SystemExit('Schema mismatch: '+table)
 names=[c['name'] for c in columns];q=lambda s:'"'+s.replace('"','""')+'"'
 rows=[]
 for row in db.execute('SELECT '+','.join(map(q,names))+' FROM '+q(table)+' ORDER BY '+','.join(q(c['name']) for c in columns if c['pk'])):
  converted={}
  for col,value in zip(columns,row):
   if col['type'].lower()=='integer' and value is not None:
    if not isinstance(value,int) or abs(value)>9007199254740991:raise SystemExit('Unsafe integer in '+table+'.'+col['name'])
    value=str(value)
   converted[col['name']]=value
  rows.append(converted)
 out['tables'][table]=rows
path=pathlib.Path(a.output)
with path.open('x') as f:json.dump(out,f,ensure_ascii=False,separators=(',',':'))
path.chmod(0o600)
print(json.dumps({'tables':len(out['tables']),'counts':{t:len(v) for t,v in out['tables'].items()},'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}))
