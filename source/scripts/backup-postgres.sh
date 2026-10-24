#!/bin/sh
set -eu
umask 077
: "${DATABASE_URL:?required}"
: "${1:?Usage: backup-postgres.sh /private/destination.dump}"
if [ -e "$1" ]; then echo 'Destination exists' >&2; exit 1; fi
pg_dump --dbname="$DATABASE_URL" --format=custom --no-owner --no-acl --file="$1"
pg_restore --list "$1" > "$1.list"
sha256sum "$1" > "$1.sha256"
