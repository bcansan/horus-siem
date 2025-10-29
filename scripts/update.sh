#!/bin/bash
set -e
git pull --rebase
docker compose pull || true
docker compose build
docker compose up -d
echo "HORUS actualizado"


