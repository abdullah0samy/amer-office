#!/bin/sh
set -eu
: "${RESTORE_DATABASE_URL:?Use an isolated empty restore database, never the live database}"
: "${1:?Usage: restore-postgres.sh /private/source.dump --approved-empty-target}"
[ "${2:-}" = '--approved-empty-target' ] || exit 1
existing=$(psql "$RESTORE_DATABASE_URL" -Atc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'")
[ "$existing" = 0 ] || { echo 'Restore target is not empty' >&2; exit 1; }
pg_restore --dbname="$RESTORE_DATABASE_URL" --no-owner --no-acl --exit-on-error --single-transaction "$1"
