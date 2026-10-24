# Configuration and external services

Each environment owns separate `.env`, PostgreSQL database, R2 bucket/credentials and email credentials. `.env.example` lists names and placeholders only. `backend/config.ts` validates required settings at startup and emits only invalid/missing field names. Never commit configured values.

| Variables | Purpose |
|---|---|
| NODE_ENV | production in hosted deployments; test for controlled tests |
| APP_ORIGIN | Exact allowed browser origin and email link origin; single value, no wildcard |
| API_ORIGIN | Public backend HTTPS origin, used to construct request URLs independently of untrusted forwarded headers |
| VITE_API_URL | Public API origin baked into frontend bundle; rebuild when changing it; never a secret |
| POSTGRES_DB / USER / PASSWORD | Private Compose PostgreSQL initialization; do not change volume credentials by editing env alone |
| DATABASE_URL | Private PostgreSQL URI; URL-encode password; provider-required TLS parameters supported by pg |
| DB_POOL_SIZE | Per-backend connection limit, default 10 |
| AUTH_SECRET | Generate with `openssl rand -hex 32`; HMAC protects stored session/recovery tokens and limiter identifiers |
| SESSION_TTL_SECONDS | 300–86400 seconds, default 28800; logout/reset revoke server sessions |
| OFFICE_OWNER_EMAIL | Immutable deployment administrator address, lowercase recommended |
| TAX_CREDENTIALS_KEY | 64 lowercase hex characters; preserve current key for existing AES-GCM ciphertext or rotate securely |
| R2_ENDPOINT / REGION / BUCKET | Account S3 endpoint, `auto` region and private bucket |
| R2_ACCESS_KEY_ID / SECRET_ACCESS_KEY | Server-only scoped R2 object credentials |
| R2_FORCE_PATH_STYLE | false for Cloudflare R2; true only for test-compatible local endpoints |
| SMTP_HOST / PORT | Your email provider SMTP endpoint, normally 587 STARTTLS or 465 implicit TLS |
| SMTP_USER / PASSWORD / FROM | Provider login and authorized sender; usernames require passwords |
| SMTP_SECURE / REQUIRE_TLS | true/true for 465; false/true for 587; production requires TLS |
| INSPECTION_SEEDS_PATH | Optional read-only private JSON seed file mount. Original real-client source seeds excluded from repository; existing saved inspection records migrate via database |
| IMPORT_JOB_TOKEN / DIGEST / EXPIRES | Optional legacy exact-batch import feature; leave blank normally; no automatic import activation |
| SOURCE_R2_* | Optional one-time source object copy credentials, not required for normal runtime |

`APP_ORIGIN` is the single CORS allowlist and CSRF origin boundary. Credentials are allowed only for that origin. API session cookies are host-only (no Domain), HttpOnly, SameSite=Strict and Secure with __Host- prefix in Production. Frontend/API must remain sibling domains of the same registrable domain. A different cross-site frontend domain would require a reviewed cookie/CSRF design, not simply widening CORS.

## R2 setup

Create company-controlled PRIVATE buckets separately for Testing and Production. Do not enable public r2.dev access or custom public document domains. Create account R2 API credentials scoped to required bucket object read/write. Configure S3 endpoint from account settings and store credentials only in Coolify secrets. Backend SDK signs outbound requests; no browser CORS configuration or bucket secrets are needed because upload/download streams pass through API authorization.

Metadata in PostgreSQL retains generated documents/UUID key, original filename, MIME, byte count, clientId, category and revision. Valid uploads: PDF, Word DOC/DOCX, Excel XLS/XLSX, CSV, PNG/JPEG up to 10 MiB. MIME/extension and format signatures are checked (CSV NUL rejection); this is format validation, not antivirus scanning or deep Office ZIP inspection. Confidential downloads check session and client assignment before object fetch; no unrestricted presigned links. Deletion records a transactional outbox; background cleanup retries failed object deletes. Unsuccessful DB transactions attempt to clean uploaded objects; process-crash orphan cleanup still needs periodic reconciliation between R2 keys and document references. Do not delete objects by simply mirroring live keys into backups.

Current Sites BUCKET binding is not an S3 key. No portable credentials have been obtained or assumed. Arrange authorized source export/access before real transfer. CLI transfers only referenced document objects and preserves their keys/type/size, downloading destination bytes again to compare SHA-256. Inventory any additional unreferenced objects separately before removing old storage.

## SMTP setup and verification

Obtain host/port/TLS mode, username/password and authorized From from your company email provider. Configure SPF/DKIM/DMARC through their instructions. Backend sends only activation/recovery messages on explicit user request, not automatic bulk invitations. Recovery responses intentionally avoid revealing whether an address exists. Link token uses URL fragment so it is not sent to frontend HTTP logs; one use, 30-minute expiration. Failed SMTP is logged as a generic event and the unmailed token is removed.

Controlled SMTP delivery and token redemption are covered by tests. Real company SMTP authentication/delivery and real certificate/TLS handshake have **not** been tested without credentials. In Testing, use an approved test mailbox and confirm delivery, spam handling, expiration, one-use behavior and correct Testing domain. Never switch off TLS or certificate validation in Production to bypass a provider error.

## DNS and Coolify

For a future approved cutover, both frontend and API hostnames need DNS records pointing to the hosting provider's supplied ingress IP or hostname. Do not guess IP addresses. Coolify assigns domain/port routing and certificates via its own Traefik. Current office.amerrashad.com remains connected to Sites; no record has been modified. Use separate Testing hostnames now. PostgreSQL service must not have public ports or Coolify public proxy enabled. Existing CNAME and domain binding removal is a separate approved Production cutover operation, not part of these scripts.

Official hosting references: [Coolify Docker Compose](https://coolify.io/docs/applications/builds/docker-compose), [Domains](https://coolify.io/docs/core/networking/domains), [Traefik routing](https://coolify.io/docs/core/networking/proxy/traefik/overview). Set frontend/API service-specific domains and internal ports in the UI; Coolify connects its proxy to required networks. Do not enable shared predefined networking for all services merely to make a public domain work.

Updated 2026-10-24: R2 export/restore also covers officeTemplates Word/page objects. Backup filenames are SHA-256 of the complete object key. The private legacy POA bootstrap package is separate from source and must not enter GitHub or unapproved Testing. Use the documented operator-only import after authorization.
