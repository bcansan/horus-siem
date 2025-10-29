#!/bin/bash

# Script de instalación automática de HORUS SIEM en Ubuntu Server

set -e

echo "==================================="
echo "   HORUS SIEM/SOC Installation"
echo "==================================="

# Verificar si es root
if [ "$EUID" -ne 0 ]; then 
  echo "Por favor ejecuta este script como root o con sudo"
  exit 1
fi

# Detectar distribución
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VER=$VERSION_ID
else
    echo "No se puede detectar la distribución"
    exit 1
fi

echo "Detectado: $OS $VER"

# Actualizar sistema
echo "[1/6] Actualizando sistema..."
apt-get update && apt-get upgrade -y

# Instalar dependencias
echo "[2/6] Instalando dependencias..."
apt-get install -y \
    curl \
    git \
    ca-certificates \
    gnupg \
    lsb-release

# Instalar Docker
echo "[3/6] Instalando Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
else
    echo "Docker ya está instalado"
fi

# Instalar Docker Compose
echo "[4/6] Instalando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo "Docker Compose ya está instalado"
fi

# Configurar sistema para Elasticsearch
echo "[5/6] Configurando sistema para Elasticsearch..."
sysctl -w vm.max_map_count=262144
if ! grep -q "vm.max_map_count=262144" /etc/sysctl.conf; then
  echo "vm.max_map_count=262144" >> /etc/sysctl.conf
fi

# Configurar firewall
echo "[6/6] Configurando firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp || true
    ufw allow 443/tcp || true
    ufw allow 8000/tcp || true
fi

# Crear archivo .env
if [ ! -f .env ]; then
    echo "Creando archivo .env..."
    cp .env.example .env
    if command -v openssl &> /dev/null; then
      SECRET_KEY=$(openssl rand -hex 32)
      sed -i "s/YOUR_SECRET_KEY_HERE/$SECRET_KEY/" .env || true
    fi
    echo "¡IMPORTANTE! Edita el archivo .env con tus configuraciones"
fi

echo ""
echo "==================================="
echo "   Instalación completada"
echo "==================================="
echo ""
echo "Pasos siguientes:"
echo "1. Edita el archivo .env con tus configuraciones"
echo "2. Ejecuta: docker-compose up -d"
echo "3. Espera 2-3 minutos a que todos los servicios inicien"
echo "4. Accede a: http://$(hostname -I | awk '{print $1}')"
echo ""
echo "Para ver logs: docker-compose logs -f"
echo "Para detener: docker-compose down"
echo ""


