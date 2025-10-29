# Troubleshooting

- Backend no levanta: `docker-compose logs -f backend` y verifica variables de entorno.
- Elasticsearch rojo: asigna más RAM con `ES_JAVA_OPTS` y revisa `vm.max_map_count`.
- No llegan eventos: revisa clave API y conectividad agente -> backend.
- Nginx 502: verifica que `backend` esté saludable (`/health`).
