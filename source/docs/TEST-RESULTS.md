# Current factual test report

2026-10-24. This report supersedes the earlier 2026-10-23 candidate report. The implementation is not declared Production-ready: Docker/real PostgreSQL service, live R2/company SMTP and Coolify browser acceptance remain gates.

Current commands: `npm ci`, `npm run typecheck`, `VITE_API_URL=https://office-api.amerrashad.com npm run build`, `npm test`, `npm run test:runtime`, `npm run test:http`, `npm audit --omit=dev`, `npm run security:scan`.

The integration/unit suite exercises financial calculations, clients/tasks/services, invoice discounts/collections/overpayment, 30% accrual and cash linkage, payroll/revision/expense cancellation, VAT/income/history/inspection/dossier, encrypted credentials, roles/assignments, private files, deletion retries, template upload/idempotency, backups/checksums, lost COMMIT acknowledgement, private legacy-template import with synthetic fixtures and migration/constraint/rollback behavior.

The new compiled HTTP test starts the production Node API and talks through pg's actual wire-protocol driver to a persistent PGlite PostgreSQL 17.5 engine over loopback TCP. It runs migration and owner-provisioning CLIs, real HTTP login/logout/CRUD/payments, SMTP activation/reset, document upload/download and role restrictions via AWS SDK to a controlled S3 server. It stops/restarts BOTH the API process and the database engine, then verifies saved data/files/session and graceful shutdown. This is a real transport test, but PGlite's single database connection is NOT a substitute for Docker PostgreSQL multi-session concurrency or container restart validation.

Docker Compose configuration parsed successfully using Compose 2.40.3. Actual build failed because daemon-socket access is prohibited. No images or containers were built/started here. Live Cloudflare R2, real SMTP TLS/authentication/delivery, real pg_dump/pg_restore, actual customer migration, Coolify Traefik/TLS/browser acceptance and GitHub CI execution are not reported as passed.

Official Node/PostgreSQL image manifests were verified and pinned by digest. Dependency audit findings were fixed by upgrading Zod to 4.6.7; current audit results and final clean-checkout test counts are attached under docs/validation/current/. Earlier logs are historical evidence, not the current result.

No tests were deleted or marked skipped to hide failures. A wire-test connection-string fixture and Zod 4 field-output typing were corrected, then tests rerun. Source financial formulas remain unchanged. Three actual private POA assets are not test fixtures and were kept outside source/history intended for GitHub. Actual prior private-data assets were never uploaded into test services.

## Clean sanitized checkout results (2026-10-24)

| Check | Actual result |
|---|---|
| npm ci, fresh directory without dependencies/build outputs | Passed, 892 packages installed |
| TypeScript typecheck | Passed |
| Production Vinext frontend + Node backend build | Passed |
| Unit/integration/business/migration/storage/auth suite | 42 passed, 0 failed, 0 skipped |
| Compiled production runtime smoke tests | 2 passed, 0 failed |
| Actual HTTP + pg-wire + controlled S3/SMTP + persistent restart | 1 passed, 0 failed |
| npm audit --omit=dev | 0 vulnerabilities |
| Source credential heuristic scan | Passed; not exhaustive proof |
| Bundled Word XML privacy scan | Two generic guides, zero 14-digit identity patterns |
| Compose configuration parse | Passed |
| Docker build/start/restart with native PostgreSQL | Blocked by daemon socket permission; not passed |
| Real Cloudflare R2, company SMTP, pg_dump/restore, Coolify browser/TLS | Not executed |

A strict TypeScript error in private-template page-array inference was found and fixed with an explicit Uint8Array[] type before this clean run. Third-party upstream license whitespace was preserved. Logs are under validation/current/.
