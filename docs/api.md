# API (resumen)

- `GET /health`: estado del backend
- `POST /api/v1/ingest`: ingesta de eventos (header `x-api-key`)
- `GET /api/v1/search?q=...&index=...&size=...`: búsqueda en ES
- `GET /api/v1/rules`: lista reglas cargadas desde `rules/`
- `GET /api/v1/alerts`: lista de alertas (placeholder)
