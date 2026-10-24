# Historical initial audit and current delta

Initial audit below describes the original 28-table/15-migration application. Current source adds the latest office-template upload feature: 29 business tables, 16 archived SQLite migrations, three PostgreSQL migrations. Templates now support private R2 upload; document/template keys are included in backup and restore tooling. See GITHUB-DELIVERY.md for current implementation and privacy segregation.

# Initial repository audit (before implementation)

Baseline commit: `361bef30125af15eb3d25cac9a14826621afffdb`. Isolated copy; production checkout and services untouched.

## Entry points and structure
`app/layout.tsx` RTL root; `app/page.tsx` client-side office SPA with panels under app/. Only root UI route; 13 API route directories with handlers, no independent backend. Shared pure business logic in lib/: claims, accruals, payroll, tax offices, income, VAT, inspections, dossiers and profile validation. Existing React components/styles/assets retained. Embedded office-template JSON assets are server-only. `app/demo.ts` contains synthetic display data. `lib/inspection-seeds.json` contains actual client references and must be excluded from distributable source and replaced by operator-importable private seed input, preserving the import workflow.

## Runtime
Current Vite configuration combines Vinext, Sites plugins, connector preview, and Cloudflare plugin. `build/sites-worker.ts` invokes Vinext Workers fetch handler. Node package engine alone does not make it portable. Vinext installed version includes standalone Node production server; test a plain Vinext config without Workers plugin before considering another framework. Frontend uses relative API fetches and anchor/image downloads; all must target public API origin with credentials. No browser private-service-name assumptions allowed.

## Data
28 application tables; 15 SQLite migrations 0000–0014. `db/schema.ts` uses Drizzle sqlite-core; `db/index.ts` uses Drizzle D1; actual route code predominantly uses db/raw.ts DB binding, parameterized prepare/bind/first/all/run and batch (see source-inventory.json). No separate query abstraction. Monetary amounts are integer minor units; UI divides by 100. JSON stored as text; dates and timestamps stored as ISO text. IDs text, predominantly UUID; payroll month IDs and defaults differ, do not force all IDs to UUID. SQLite backticks, placeholders, json_each and integer truthiness need review. D1 batch assumes transaction atomicity; pre-read then write workflows require request-level isolation/locking to prevent concurrent overspend. Revision CAS, payment replay IDs and audit/history must be preserved. 0013/0014 are historical data transformations, not fresh PostgreSQL seed instructions.

## Storage
Only document API calls bucket() get/put/delete via native BUCKET. PostgreSQL metadata stores ownership/clientId, generated object key, MIME, bytes, filename, category, revision. Max upload currently 10 MiB. Download calls demandClient before bucket read. Templates are bundled originals/images and have management authorization; not stored in R2. Replace binding with private S3 client, preserve keys and authenticated streaming; validate MIME/content and errors.

## Identity and permissions
Platform-injected oai identity trusted by lib/office-auth.ts. OFFICE_OWNER_EMAIL grants owner. accessUsers associates email with staff; roles owner/manager/employee and per-client task/assignment checks already exist. No password/session storage or mail transport. Page has ChatGPT sign-in link. Keep existing per-operation restrictions. Remove provider headers entirely from auth. Need local invite-only passwords/sessions; initial owner through CLI. Cross-origin frontend/API requires host-only API cookie, credentials and strict CORS/origin checks.

## Integrations / configuration
DB and BUCKET runtime bindings; OFFICE_OWNER_EMAIL; TAX_CREDENTIALS_KEY (AES-GCM also used for profile secrets); temporary IMPORT_JOB_TOKEN/DIGEST/EXPIRES. Egyptian tax service HTTPS token/search external integration is standard fetch; do not contact for synthetic tests. Preserve encryption key or perform secure rotation before real import. Sites connector plumbing exists but no business route uses it; remove unused platform plumbing, not application functionality. WhatsApp links/Web Share are user initiated UI features, no mail server. See machine inventory for exact locations.

## Existing validation and deployment
One committed automated income test file; no comprehensive integration suite. Package build invokes Sites framework wrappers and Wrangler preview; pnpm lock/workspace retained at baseline. No Docker/Coolify config. Production data/credentials/export access NOT available in source. Official D1 supported export uses wrangler d1 export --remote with authorized account/database access; managed Sites binding does not confer portable credentials. Real export is a separate unresolved operator step.

## Component target map
| Existing | Target |
|---|---|
| Vinext Workers UI + API | Vinext Node frontend plus independently built Node API router |
| DB prepare/bind/batch | parameterized pg adapter preserving result shape and request transaction |
| SQLite schema/migrations | versioned PostgreSQL baseline + checksum migration runner |
| BUCKET binding | server-only AWS S3 SDK R2 adapter |
| platform identity | local scrypt passwords + opaque hashed server sessions |
| Sites auth links | own login/logout + account provisioning/recovery |
| relative fetch/download | public API URL and credentialed browser requests |
| env bindings | validated Node env, separate environments |
| Worker deploy | two Dockerfiles, Compose, Coolify Traefik domains |
| private source seeds | operator-only import input, no actual clients committed |
| ad hoc migrations | release command, locked migration ledger, no startup DDL |

## Initial execution constraints
Docker client/daemon and PostgreSQL binaries are absent in this execution environment. This is a validation blocker until tools become available; never mark Docker build/start as passed. Native package installation attempt failed on restricted setuid/setgroups. Use available alternatives only for additional tests, not as claims of Docker validation.
