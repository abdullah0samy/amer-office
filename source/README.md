# Amer Rashad Office — independent Coolify migration

**Status: implemented migration candidate, not yet production-ready.** See [test results](docs/TEST-RESULTS.md) for executed checks and blocking validations. Original hosted application, D1, files, authentication and DNS remain untouched. This repository does not contain customer records, actual credentials or a production export.

## Architecture

- Frontend: retained Arabic RTL React 19/TypeScript/Tailwind 4 UI, Vinext Node server; port 3000. No business API handlers in frontend.
- Backend: separately built TypeScript Node HTTP service, Web Request/Response API handlers; port 3001. Existing business modules/authorization retained.
- PostgreSQL: separate private service, 29 business tables (28 original plus office templates) plus authentication/session/rate-limit and storage-deletion tables. Amounts remain integer **piastres**, dates/timestamps ISO strings, JSON stays text to preserve current serialization.
- Storage: private R2 through AWS S3 SDK; authenticated downloads through backend. No bucket credentials in browser.
- Authentication: invite-only office accounts, scrypt password hashes, opaque server-side sessions, host-only HttpOnly cookies, server-side owner/manager/employee and client assignment checks. No ChatGPT authentication or trusted provider headers.
- Coolify Traefik terminates TLS. No additional reverse proxy.

Production frontend: `https://office.amerrashad.com`.
Production API: `https://office-api.amerrashad.com`.
Browser requests use public HTTPS API URL set by `VITE_API_URL`, with credentials. PostgreSQL uses private Docker hostname `postgres`; browsers never receive it. There is no server-side frontend data fetch requiring a private API hostname; the retained app is client-side. Containers use their private networks for PostgreSQL; public UI/API traffic uses their configured domains.

## Prerequisites and build

Node 24.22.1, npm, Docker Engine with Compose v2; private R2 and SMTP configuration for real integrations. Dependencies are pinned directly and by package-lock.json. Node 24.22.1 and PostgreSQL 17.10 images are pinned by verified manifest digests; Docker build execution still requires an accessible Docker daemon. No production secrets are built into images.

```sh
npm ci
npm run typecheck
VITE_API_URL=https://office-api.amerrashad.com npm run build
npm test
npm run test:runtime
npm run test:http
```

`npm test` uses the embedded PostgreSQL 17.5 PGlite engine by default, a controlled HTTP S3 protocol server and a controlled SMTP server. This is **not** Docker, a live R2 account, or a separate PostgreSQL service. For a fresh, disposable PostgreSQL instance set `TEST_DATABASE_URL`; the same suite then uses the real pg driver and separate database connections. Never point it at customer/production data. [Coverage and limitations](docs/TEST-RESULTS.md).

## Full local Docker validation

Run this before accepting the migration; **not executed in the authoring environment** because access to the Docker daemon socket is prohibited (Compose configuration was parsed successfully).

```sh
node scripts/create-validation-env.mjs
npm run test:docker
```

This creates a separate `.env.validation` with generated synthetic secrets, builds both images and test image, starts private PostgreSQL, applies migrations explicitly, executes tests against the separate PostgreSQL service, and starts/restarts both services. Uses project name `office-migration-validation`, only loopback frontend/API ports. No customer data or R2/SMTP production credentials are used. S3 and SMTP tests start their own controlled servers; this does not verify live Cloudflare R2. Full browser workflow acceptance and real R2 test remain separate.

Logs / restart / stop:

```sh
docker compose --project-name office-migration-validation --env-file .env.validation -f compose.yaml -f compose.validation.yaml logs --tail=100 backend frontend
# For subsequent commands keep APP_ENV_FILE set so service env_file resolves correctly.
export APP_ENV_FILE=.env.validation
docker compose --project-name office-migration-validation --env-file .env.validation -f compose.yaml -f compose.validation.yaml restart backend frontend
docker compose --project-name office-migration-validation --env-file .env.validation -f compose.yaml -f compose.validation.yaml down
```

The validation database persists. Repeated integration suites require a fresh disposable database; do not delete unrelated or production volumes. To discard **only this synthetic project** after inspection, use the same validation command with `down --volumes`.

## Independent Coolify Testing deployment

1. Use the authorized GitHub repository and a **separate Testing Coolify project** with its own domains (e.g. `office-test.amerrashad.com` and `office-api-test.amerrashad.com`). Do not change the current live domain.
2. Provision PostgreSQL on the private network. Import the Compose definition as a Coolify resource, or create two Dockerfile resources plus PostgreSQL and join backend to its private network. No PostgreSQL public port. If separately provisioned, use its actual private service hostname in DATABASE_URL.
3. Copy `.env.example` to an untracked `.env` / inject Coolify secrets. Use separate Testing database, R2 bucket and SMTP settings. Frontend build arg `VITE_API_URL` must be the Testing **public HTTPS API origin**. Backend `APP_ORIGIN` must exactly match Testing frontend origin, without trailing slash; `API_ORIGIN` matches API origin.
4. In Coolify Domains, select the receiving service and set frontend HTTPS hostname with internal port 3000, backend HTTPS hostname with internal port 3001 (single-field form: `https://office-test.amerrashad.com:3000` and `https://office-api-test.amerrashad.com:3001`). Public browser URLs still use standard HTTPS, without these internal port suffixes. Coolify manages proxy networks/certificates. Do not create another proxy. Do not globally attach PostgreSQL to an unrelated shared network; inspect the generated Compose networking.
5. Build images. Start PostgreSQL. Run the migration release job below once; migrations are never run automatically on normal app start. Then start backend/frontend.
6. Provision owner securely; verify SMTP setup and use activation for approved staff only. Run acceptance/regression tests with synthetic data, real Testing R2 credentials, role restrictions and browser downloads. Perform database AND object restore drills. Do not load actual customers or cut over Production until all gates pass.

Release commands (inside this repository, with Testing `.env`):

```sh
docker compose build
docker compose up -d postgres
docker compose run --rm --no-deps backend node dist-backend/migrate.js
docker compose up -d backend frontend
docker compose logs --tail=100 backend frontend
```

Migration ledger uses checksums and an advisory lock; altered history, unknown migrations and incompatible existing tables fail instead of being replaced. Do not edit already-applied migration files; append migrations. Backup before release. Normal startup performs no DDL. Deploying the code alone does not transfer data.

Health: frontend `/health` (HTTP 200 when frontend serves); backend `/live` for process liveness, `/health` for database/schema readiness (503 when unavailable). No infrastructure details or secrets are returned. Structured backend request logs include request ID, method, path without query, status and duration; not request body/cookie/password. SIGTERM stops listeners, drains requests and closes pool; Docker has 30s grace.

## Initial owner and employee accounts

Set `OFFICE_OWNER_EMAIL` to your actual administrator email. No default password exists. In Bash on your secure administration machine:

```sh
read -r -s -p 'Owner password (12+ characters): ' OFFICE_INITIAL_PASSWORD
printf '\n'
printf '%s' "$OFFICE_INITIAL_PASSWORD" | docker compose run --rm -T backend node dist-backend/admin.js owner@your-domain.example
unset OFFICE_INITIAL_PASSWORD
```

Use the same owner email as configured. Do not put passwords in command arguments or shell history. The CLI verifies existing owner/active staff authorization and revokes old sessions. Owner creates staff and access entries through the existing permissions UI. Employee then uses the login screen's activation/recovery button; email proof via a 30-minute one-use link sets a password and revokes earlier sessions. No open registration; email domain by itself grants no access. Suspending accessUsers blocks existing sessions immediately. Owner can use CLI for a verified administrative reset. No actual employee invitations have been sent during migration.

## Configuration / services

[Environment reference, SMTP and R2 setup](docs/CONFIGURATION.md).
[Audit and component map](docs/AUDIT.md), [query inventory](docs/sql-inventory.json).
[Data export, conversion, reconciliation and separate Production procedure](docs/DATA-MIGRATION.md).
[Backup and restore](docs/BACKUP-RESTORE.md).
[Actual test results and blockers](docs/TEST-RESULTS.md).

## GitHub publication

The authorized destination is `https://github.com/abdullah0samy/amer-office.git`. The destination was readable and empty at inspection; authenticated push is currently unavailable. The release repository uses clean sanitized history: earlier private migration history embedded personal identity numbers in power-of-attorney assets and must NEVER be pushed. The release code excludes those assets and has a separate private import procedure. Existing destination history must be fetched and preserved before any later push; never force push.

For the sanitized release checkout:

```sh
git remote -v
# Add only if origin is absent; otherwise inspect its URL first.
git remote add origin https://github.com/abdullah0samy/amer-office.git
git fetch origin
git push -u origin main
```

If using the source ZIP without `.git`, initialize locally first:

```sh
git init -b main
git add .
git commit -m "Migrate office application to independent Node and PostgreSQL"
# Then add the actual private remote and push as above.
```

Never add `.env`, exported customer records, original private inspection seed lists, backups, uploads, keys, node_modules or dist. Templates and office brand assets are application assets; the repository should remain private. CI workflow is provided but has not run on GitHub.

The delivery archive also includes `amer-office-coolify.bundle`, a standalone Git bundle with the clean local history. To use it, extract the archive and run `git clone amer-office-coolify.bundle office-repo`, then add your actual private GitHub origin and push main. The archive also includes the plain source tree for direct review.


## Private legacy office templates

Three original power-of-attorney models contained personal identity numbers. Their Word bytes and rendered pages are deliberately excluded from GitHub and its history, not removed from application capabilities. The two generic compliance guides remain bundled. Owner-uploaded new models work through the existing Add Template UI, with Word plus images/PDF conversion, and are stored privately in R2/PostgreSQL.

The separate **PRIVATE_Office_Templates_DO_NOT_PUSH.zip** is confidential operator data, not source code. Keep it outside the repository; never upload it to GitHub or an unapproved Testing environment. Once the target environment is authorized for that personal data and private R2 is configured, extract it securely and run a one-off read-only mount:

```sh
docker compose run --rm -v /YOUR_PRIVATE_DIRECTORY:/private/templates:ro backend node dist-backend/import-office-templates.js /private/templates
```

The importer preserves legacy model IDs, Word bytes, page order and SHA-256, uploads private R2 objects and inserts officeTemplates metadata transactionally. Re-running verifies existing bytes instead of duplicating rows. Test it using synthetic fixtures first. Real legacy-template import was NOT run during this task. All original model workflows are supported after this controlled data bootstrap.

The SQL/object transfer procedures now include uploaded office templates as well as client documents. No actual customer export or production migration has been attempted.
