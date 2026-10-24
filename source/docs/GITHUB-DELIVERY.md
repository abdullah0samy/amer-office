# Current delivery and publication status

Date: 2026-10-24. Authorized target: https://github.com/abdullah0samy/amer-office.git

## Implemented

Independent Vinext/React 19/TypeScript/Tailwind 4 Node frontend and separate Node HTTP API. PostgreSQL with three versioned migrations, 29 business tables plus auth/storage operational tables, preserved IDs, integer minor-unit money, JSON/ISO text, FKs, indexes, checksum ledger and request transaction/advisory-lock boundaries. All original workflows retained. Owner/manager/employee checks, scrypt passwords, opaque hashed sessions, recovery/activation mail, strict origin/CORS controls, private authenticated S3/R2 files and durable deletion queue.

Latest current-application template feature was ported: owner Add Template button, original Word download, PDF-to-JPEG browser conversion, page preview/reordering, idempotent upload and private R2 storage. Transfer/backup tooling now discovers both client documents and template assets. Lost COMMIT acknowledgement no longer causes upload cleanup to delete potentially committed objects.

Node 24.22.1 and PostgreSQL 17.10 image manifests were checked against the official registry and pinned by digest. Zod upgraded to 4.6.7 after an actual high-severity dependency advisory; typing updated, validation/business regression tests retained. No production schema, files, authentication or DNS changed.

## Privacy and history

Three POA assets contained personal identity numbers. Those Word files and page images are segregated into a private operator bundle outside the release source. An audited, idempotent operator importer preserves their legacy IDs and private R2 references. No actual private-data import was run. Generic compliance guides remain bundled; all template capabilities remain available.

The earlier local c03ae97 source history contains those private assets; it must NOT be published. The deliverable release repository is created from the sanitized source only. This does not overwrite destination history: the authorized destination was empty at read-only inspection, and any new remote commits must be reconciled rather than force-pushed.

## Confirmed access blockers

HTTPS write probe returned:
`fatal: could not read Username for 'https://github.com': terminal prompts disabled`

No Git credential helper, GH_TOKEN or GITHUB_TOKEN was configured. GitHub integration was offered but is not confirmed connected. SSH probe returned a name-resolution failure; no unsafe host-key acceptance or credential probing was performed. Actual final push result is recorded separately after commit.

Docker Compose 2.40.3 was obtained from official Ubuntu packages and successfully parsed the isolated Compose configuration. Attempted build failed before building any image:
`permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock ... socket: operation not permitted`

No privileged/container-network bypass was attempted. This is not a successful Docker test.

## Required independent Coolify Testing steps

1. Publish the sanitized source to the authorized repository with an authenticated GitHub account. Fetch remote refs before pushing; never force push. Do not publish the separate private bundle.
2. Create a separate Coolify Testing project with fresh PostgreSQL, private Testing R2 bucket and approved SMTP test mailbox. Do not use current Production data or domains.
3. Use Dockerfile.frontend (port 3000) and Dockerfile.backend (port 3001), or the Compose resource. PostgreSQL has no host port. Coolify manages Traefik; do not add another proxy.
4. Configure Testing frontend/API HTTPS subdomains. Set build-time VITE_API_URL to the public Testing API HTTPS URL; APP_ORIGIN to the exact Testing frontend origin; API_ORIGIN to the Testing API origin. Use private PostgreSQL service hostname in DATABASE_URL.
5. Set all secret values securely from .env.example. Run the explicit migration release command before starting backend; normal startup does not alter schema. Provision owner via stdin-only CLI.
6. Run `npm run test:docker` first on a clean disposable Docker environment; it validates real PostgreSQL, actual HTTP reachability and readiness after restart. Test data remains isolated.
7. Test private R2 and company SMTP with real Testing credentials, browser login/CORS/cookies, Word/PNG/PDF downloads, all workflows and real PostgreSQL backup/restore. These provider and Docker gates remain unverified here.
8. Only after separate authorization may actual customer/private-template data be moved. No Production cutover or DNS change is part of this deliverable.

## Final publication attempt

The sanitized source was committed locally, then `GIT_TERMINAL_PROMPT=0 GCM_INTERACTIVE=never git push -u origin main` was executed. It failed with:

```text
fatal: could not read Username for 'https://github.com': terminal prompts disabled
```

No GitHub publication is claimed. The remote was fetched successfully and contained no commits. A connected/authenticated GitHub account with write permission is required; never paste credentials into this report or source. From the sanitized release repository, after authentication:

```sh
git remote -v
git fetch origin
# If origin/main appeared, inspect and reconcile it before proceeding; never force push.
git push -u origin main
```
