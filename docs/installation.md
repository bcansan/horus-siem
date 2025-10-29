# Instalación

1. Requisitos: Ubuntu 20.04+, 4 CPU, 8 GB RAM, 50 GB SSD.
2. Clonar repositorio y ejecutar instalador:

```bash
git clone https://github.com/bcansan/horus.git
cd horus
sudo ./install.sh
cp .env.example .env
# Editar .env si aplica
sudo docker-compose up -d
```

3. Acceso: `http://<IP-SERVIDOR>`
