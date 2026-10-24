# Engineering delivery summary

The retained application was implemented as a Node Vinext frontend and separate Node API with pg/PostgreSQL, private R2 SDK storage and independent application accounts. See README for public-domain configuration and Coolify steps. Status: migration candidate; outstanding validation prevents a production-ready declaration.

## Main changes
- `app/`: retained UI/panels, credentialed API URL helper, own login/logout/reset screens and updated account explanations; root RTL/styles/assets preserved.
- `backend/server.ts`, `handler.ts`: separate HTTP service, route registry, strict origin/CORS handling, structured logs, health/readiness, request size/time limits and graceful shutdown.
- `backend/routes/`: all 13 original business API modules moved with validation/business rules and role checks preserved; SQLite JSON query adjusted explicitly.
- `db/raw.ts`, `backend/sql.ts`: pg pooled parameterized access, lexical identifier/placeholder conversion and D1-compatible statement result shape; real transactions and a per-application advisory writer lock covering pre-read/guard/write/audit sequence.
- `migrations/`: versioned PostgreSQL baseline preserving 29 business tables/constraints plus five auth/storage operational tables; migration ledger/checksum/lock, no normal startup DDL.
- `backend/storage.ts`, `files.ts`, `cleanup.ts`: server-only S3 R2, private authorized streaming, 10 MiB format validation and transactional deletion outbox with retries/rollback cleanup.
- `backend/password.ts`, `auth.ts`, `mail.ts`, `admin.ts`: scrypt passwords, HMAC-hashed opaque sessions, active role checks, invite-only email activation/recovery, controlled SMTP integration, secure CLI owner provisioning.
- `backend/data-tools.ts`, import/verify/transfer CLIs and scripts/: offline authorized data/object conversion, reconciliation and backup/restore commands.
- Dockerfiles, Compose variants, environment templates and CI workflow: separate services, private PostgreSQL volume/network, no extra proxy; Docker execution remains unverified.
- `legacy/`: original SQLite schema/migrations for review only; real-client inspection seeds excluded and optionally loaded from private mount.
- `docs/`, tests/: source audit/query inventory, unchanged business-rule hashes, deployment/configuration/data/recovery instructions and actual test evidence.

## PostgreSQL compatibility decisions
Existing text IDs/ISO date strings/JSON text are retained. Integer fields map to BIGINT, remain integer piastres, and pg parsers reject unsafe numeric conversion. Mixed-case names are quoted consistently. Parameters are converted lexically outside strings/comments, not interpolated. SQLite json_each used for income document references was converted to jsonb_array_elements_text. Empty financial projections use WHERE FALSE. D1 batch uses a PostgreSQL transaction; all request writers acquire the same transaction-scoped advisory lock before reading balances. This intentionally trades write throughput for correctness appropriate to a small office. Historical normalization/inspection seed DML is not replayed during final-state import.

Source-control delivery is a new local Git repository with clean history, not a copy of the old Sites history. The authorized GitHub destination is https://github.com/abdullah0samy/amer-office.git; see GITHUB-DELIVERY.md for access blockers and final push status. Do not publish customer exports/private seed files. Original production is untouched.

Read docs/TEST-RESULTS.md before deployment: passing local Node/embedded-engine tests is not evidence that Docker, live PostgreSQL, R2, company SMTP, Coolify or real customer migration succeeded.
