# HORUS SIEM/SOC

Sistema SIEM/SOC moderno y eficiente. Despliegue rápido en Ubuntu Server con Docker Compose.

## Quickstart

```bash
# En el servidor Linux
sudo apt-get update -y
sudo apt-get install -y git

git clone https://github.com/bcansan/horus.git
cd horus
sudo ./install.sh

# Edita .env si es necesario
sudo docker-compose up -d

# Accede a la app
http://<IP-SERVIDOR>
```

## Servicios
- Nginx (reverse proxy + frontend)
- Backend FastAPI (API y WebSocket)
- PostgreSQL (metadatos)
- Redis (colas/cache)
- Celery (workers)
- Elasticsearch (logs)

## Desarrollo
```bash
# Backend (hot-reload con volumen)
docker-compose up -d backend

# Frontend
docker-compose up -d frontend

# Todo el stack
docker-compose up -d
```

## Licencia
MIT
