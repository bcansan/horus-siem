#!/bin/bash
set -e
FILE=$1
if [ -z "$FILE" ]; then
  echo "Uso: $0 <backup.sql.gz>"
  exit 1
fi
gunzip -c "$FILE" | docker compose exec -T postgres psql -U horus -d horus
echo "Restauración completada"


