# Actual data migration: separate authorized operation

**No real production export or customer migration has been executed.** Scripts are offline/preparation tools and do not modify the existing hosted service. Never infer successful data transfer from passing synthetic tests.

## Supported D1 export and current access limitation

The runtime currently accesses D1 via Cloudflare `DB` binding. It is not a remote SQL connection string; `DB` is not necessarily the actual Cloudflare database name. Official export route, once the actual owning Cloudflare account and database are accessible to an authorized administrator:

```sh
npx wrangler d1 export ACTUAL_DATABASE_NAME --remote --output=/private/source.sql
```

Use actual Cloudflare permissions/account/database ID supplied by its owner. [Official D1 import/export documentation](https://developers.cloudflare.com/d1/best-practices/import-export-data/). This command is documented, **not run**. Current managed Sites access has not established portable D1 credentials, the actual database ID/name, or a supported export control. Request an authorized managed-host schema/data export from the provider if account access is unavailable. Do not add a public SQL/export endpoint or use application login headers to bypass this boundary. The source schema in this repository is code-derived, not proof of current live schema contents.

## Export / transformation / reconciliation

Use encrypted access-controlled staging outside repository, never public GitHub or ordinary chat attachments. Arrange a consistent source snapshot while writes are frozen, or provider-supported snapshot mechanism; preserve original unchanged encrypted backup.

1. Obtain authorized D1 SQL dump and all R2 objects/metadata, plus secure separate access to TAX_CREDENTIALS_KEY. Source credentials and encryption key are not in this repository.
2. Convert an authorized SQLite database copy or SQL export **offline**:

```sh
python3 scripts/export-sqlite.py /private/source.sql /private/source-export.json --sql-dump
# Or read-only SQLite database input:
python3 scripts/export-sqlite.py /private/source.sqlite /private/source-export.json
```

Converter executes dump only into in-memory SQLite with ATTACH/file extension operations denied. Accept only trusted provider dumps; it is not a sandbox for arbitrary uploaded SQL. It verifies all 29 tables/columns and FK integrity, retains IDs/strings/timestamps/serialized JSON unchanged, exports integers as decimal strings and rejects unsafe integer values. Output is newly created mode 0600. No actual dump is bundled. Inspect any schema drift before conversion; do not silently discard unknown columns or extra application tables.

3. Initialize an **empty target** with versioned PostgreSQL migrations. Never replay legacy SQLite data migrations 0013/0014 on imported final state. Baseline includes the schema as of all 16 legacy migrations, not their historical seed actions.
4. Mount the private export file into a one-off backend container, read-only. Run:

```sh
# Example assumes /private/source-export.json is securely mounted in container.
node dist-backend/import-data.js --approved-empty-target /private/source-export.json
node dist-backend/verify-data.js /private/source-export.json
```

For Docker add a scoped read-only bind mount in `docker compose run`, do not put source records into an image. `importData` requires all business tables empty, imports in one transaction with deferred FKs, checks all constraints before commit, and compares **every table's row count, canonical row SHA-256, and amount/discount/price/size totals**. Fixed schema allowlists/quoted identifiers/parameterized values prevent SQL interpolation. Duplicate PKs, invalid rows, unexpected fields, FK violations, unsafe integers and mismatches fail and roll back. Script exit status is nonzero; failures report table/message, not raw customer rows. Keep job logs in restricted staging. A partially completed row loop never commits.

5. Preserve/migrate original AES-GCM key via secure administrative channel before verifying secret retrieval. Ciphertext alone is insufficient. If rotating keys, design and test explicit decryption/re-encryption with old key available, not a blind environment change.
6. Move objects only after obtaining portable source access. Existing BUCKET runtime binding does not provide source S3 credentials. Methods:

```sh
# Authorized source/destination S3 env sets, preserving referenced object keys:
node dist-backend/transfer-objects.js copy-source
# Or export references from a reachable source R2 to encrypted private staging:
node dist-backend/transfer-objects.js export /private/object-backup
# Restore that manifest/bytes into a separate target bucket:
node dist-backend/transfer-objects.js import /private/object-backup
```

The tool reads `documents` and `officeTemplates` metadata from the database selected by DATABASE_URL. Ensure it represents the source references. It transfers referenced client documents plus owner-uploaded template Word/page assets; obtain a complete provider object inventory separately to discover any unreferenced files. For each reference it verifies key safety, content size, original MIME and SHA-256 after destination download. Export manifest records document ID/key/type/size/hash. Source missing files or destination mismatches fail, reporting completed count. Object operations are not globally transactional; retry copy/import safely with same immutable source and keys, then rerun verification. Do not delete source objects.

## Synthetic validation versus customer data

Tests use generated clients/staff, invoices/payments, payroll, accruals, documents, VAT/income and inspection data. No real client seed list is committed. Saved production inspection cases migrate normally; if original source-plan matching UI is still needed, mount the private original JSON at INSPECTION_SEEDS_PATH separately. No customer records may be loaded into unapproved Testing environments.

## Future Production enablement (not performed)

Only after independent Testing acceptance, Docker/real-PostgreSQL tests, real Testing R2 checks, SMTP and browser checks, and database/object restore drill:

1. Obtain owner's explicit Production cutover authorization and maintenance window. Record current DNS, old service access and rollback owner.
2. Freeze writes through an approved operational mechanism on source; take final consistent D1 and object snapshots and secure encryption-key backup. This migration repository does not change the source service or freeze it automatically.
3. Import final snapshot to a fresh Production PostgreSQL service; transfer objects; run counts, per-row hashes and financial-total checks; reconcile invoices/collections/payroll/accruals, attachment downloads and secret decryption.
4. Provision owner account, approved employee authorization and Production secrets. Do not reuse source ChatGPT sessions or infer passwords. Health checks and HTTPS/CORS/cookie behavior must pass on final intended domains.
5. Coordinate current Sites hostname binding removal and DNS change only with authorization. Route frontend and API through Coolify Traefik to their respective ports, never to PostgreSQL.
6. Recheck flows using owner and restricted staff accounts. Resume writes only after acceptance. Keep source and snapshots available read-only for agreed retention.
7. If verification fails before new writes, revert routing to original service. If new system has already accepted writes, reconcile/delta-export those writes before rollback to avoid data loss. Do not point to a stale database and call that recovery.

Updated 2026-10-24: R2 export/restore also covers officeTemplates Word/page objects. Backup filenames are SHA-256 of the complete object key. The private legacy POA bootstrap package is separate from source and must not enter GitHub or unapproved Testing. Use the documented operator-only import after authorization.
