#!/bin/bash
set -e
DIR=${1:-backups}
mkdir -p "$DIR"
TS=$(date +%Y%m%d-%H%M%S)
FILE="$DIR/postgres-$TS.sql.gz"
docker compose exec -T postgres pg_dump -U horus horus | gzip > "$FILE"
echo "Backup creado: $FILE"


