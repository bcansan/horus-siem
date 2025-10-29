# Despliegue en producción

- Configurar DNS y SSL (Let's Encrypt) en `nginx/ssl` o usar proxy externo.
- Ajustar límites de JVM de Elasticsearch con `ES_JAVA_OPTS`.
- Tunear `vm.max_map_count` (instalador ya lo realiza).
- Usar volúmenes dedicados SSD para `postgres`, `elasticsearch`.

## Comandos útiles
```bash
docker-compose up -d
docker-compose ps
docker-compose logs -f nginx
```
