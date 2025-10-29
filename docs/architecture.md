# Arquitectura

- Nginx: reverse proxy, sirve frontend estático
- Backend: FastAPI, expone REST/WS, encola eventos a Redis
- Celery workers: consumen cola, indexan en Elasticsearch
- PostgreSQL: metadatos, usuarios, API keys
- Redis: cola/cache
- Elasticsearch: almacenamiento de logs
- Agente: recolector multiplataforma, buffer local en SQLite
