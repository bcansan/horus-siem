#!/bin/bash
set -e
echo "Checking containers..."
docker compose ps
echo "Checking backend health..."
curl -sf http://localhost:8000/health || (echo "Backend not healthy" && exit 1)
echo "OK"


