#!/bin/sh
set -eu
[ -f .env.validation ] || node scripts/create-validation-env.mjs
grep -q '^POSTGRES_DB=office_validation$' .env.validation || { echo 'Refusing non-validation database' >&2; exit 1; }
export APP_ENV_FILE=.env.validation
compose() { docker compose --project-name office-migration-validation --env-file .env.validation -f compose.yaml -f compose.validation.yaml "$@"; }
ready() {
  service=$1
  if [ "$service" = backend ]; then port=3001; else port=3000; fi
  attempt=0
  until compose exec -T "$service" node -e "fetch('http://127.0.0.1:$port/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; do
    attempt=$((attempt+1)); [ "$attempt" -lt 30 ] || exit 1; sleep 2
  done
}
compose build --pull
compose up -d postgres
compose run --rm --no-deps backend node dist-backend/migrate.js
# Same integration suite uses pg and the separate real PostgreSQL service here.
compose run --rm validation
compose up -d backend frontend
ready backend
ready frontend
# Confirm actual HTTP services are reachable on the shared application network.
compose exec -T frontend node -e "Promise.all([fetch('http://127.0.0.1:3000/'),fetch('http://backend:3001/health')]).then(r=>process.exit(r.every(x=>x.ok)?0:1)).catch(()=>process.exit(1))"
compose restart backend frontend
ready backend
ready frontend
compose exec -T frontend node -e "fetch('http://backend:3001/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
compose ps
printf '%s\n' 'Docker build, real PostgreSQL integration, HTTP readiness and restart checks passed.'
# Preserve synthetic volumes for inspection. Discard ONLY this isolated project when finished.
