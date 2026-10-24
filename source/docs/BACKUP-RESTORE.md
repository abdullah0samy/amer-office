# Backup / restore operations and mandatory drill

A backup is not accepted until restoration is verified. **pg_dump/pg_restore and real R2 restore have not been executed in the current environment**. Synthetic PostgreSQL import/reconciliation tests cover only the implemented data-import path, not these operational backups.

## PostgreSQL

Use PostgreSQL 17 compatible client tools in an administration environment on the private database network; do not expose PostgreSQL publicly. Separate backup credentials with necessary read privileges where possible. Never log connection URI/password.

```sh
# DATABASE_URL injected securely by administration environment:
sh scripts/backup-postgres.sh /private/office-20261023.dump
```

Script writes custom-format pg_dump, TOC and SHA-256 files with restrictive umask; fails rather than overwriting an existing dump. pg_dump captures a consistent database snapshot. Before a coordinated database+object backup, stop app writes by approved maintenance procedure; the live object set and DB snapshots otherwise may not align. Encrypt resulting files at rest and in transit with your company's backup solution and copy outside the server. The script does not claim to implement encryption or scheduling. Preserve migrations ledger, schema, data, authorization and encrypted credential fields; back up TAX_CREDENTIALS_KEY separately with restricted recovery access.

For restore, create an entirely new empty isolated database, inject RESTORE_DATABASE_URL, and verify dump checksum:

```sh
sha256sum --check /private/office-20261023.dump.sha256
sh scripts/restore-postgres.sh /private/office-20261023.dump --approved-empty-target
```

Restore refuses a nonempty public schema, uses a single transaction and exits on error; it does not drop/recreate a live database. The client must reach target via private administration network or a one-off container, never an opened public database port. As an alternative, use Coolify backup storage if the hosting team configures it and demonstrates a successful restore to a separate database; do not assume the hosting quote includes working recoverability.

## R2 documents

Use the object transfer CLI with the database snapshot's `documents` and `officeTemplates` references:

```sh
node dist-backend/transfer-objects.js export /private/object-backup-20261023
# Back up manifest and binary files together, encrypted and independently retained.
```

Keep independent retention/protected copies; the active R2 bucket alone and a mirror that repeats accidental deletions are not backups. Configure bucket object retention/backup permissions with provider support; do not assume AWS bucket versioning features are available on R2. Restore into a **separate** private bucket with restored database selected:

```sh
node dist-backend/transfer-objects.js import /private/object-backup-20261023
```

Every referenced object's size and downloaded SHA-256 is verified. Restore does not change document keys or create public URLs. If source contains additional objects not referenced by documents or officeTemplates, inventory/preserve them separately before cleanup. Pending storageDeletions rows restored from a database backup represent intended deletion actions; review them before starting backend cleanup against restored storage.

## Drill acceptance record

On independent Testing infrastructure:

1. Create synthetic records covering invoice/partial payment/payroll/accrual and uploaded files; capture row-count/financial/hash baseline.
2. Take coordinated database/object/key backups; simulate loss only in isolated copies.
3. Restore dump to fresh PostgreSQL and object archive to a fresh private bucket.
4. Re-run data verification and object checks, then validate login/permissions, client file retrieval, totals, histories and encrypted secret retrieval.
5. Record backup time, restore time, recovered point, tested retention, destination ownership and responsible person. Agree RPO/RTO with owner rather than inventing them.
6. Do not mark complete until command logs and comparisons are retained. No successful drill is claimed in this delivery.

## Background object cleanup

Deletion removes database metadata and enqueues object key in storageDeletions atomically. A single locked worker retries physical deletion every minute; failures increment attempts without dropping the job. Alert on persistent backlog. Upload rollback attempts compensating delete; a process crash after object upload but before DB commit can leave an orphan. Periodic read-only comparison of R2 key inventory with document references, followed by a reviewed retention delay before deleting unreferenced objects, is still an operational requirement. Never delete a key still referenced by a restored backup you intend to retain.

Updated 2026-10-24: R2 export/restore also covers officeTemplates Word/page objects. Backup filenames are SHA-256 of the complete object key. The private legacy POA bootstrap package is separate from source and must not enter GitHub or unapproved Testing. Use the documented operator-only import after authorization.
