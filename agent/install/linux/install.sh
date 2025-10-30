#!/bin/bash
# HORUS Agent - Linux Installation Script
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SERVER_URL=""
API_KEY=""
AGENT_VERSION="1.0.0"
INSTALL_DIR="/usr/local/bin"
CONFIG_DIR="/etc/horus"

while [[ $# -gt 0 ]]; do
  case $1 in
    --server-url)
      SERVER_URL="$2"; shift 2;;
    --api-key)
      API_KEY="$2"; shift 2;;
    *) echo "Unknown option: $1"; exit 1;;
  esac
done

if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Please run as root or with sudo${NC}"; exit 1
fi

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}  HORUS Agent Installation${NC}"
echo -e "${GREEN}==================================${NC}"

if [ -z "$SERVER_URL" ]; then read -p "Enter HORUS Server URL: " SERVER_URL; fi
if [ -z "$API_KEY" ]; then read -p "Enter API Key (optional): " API_KEY; fi

echo -e "\n${YELLOW}[1/5]${NC} Downloading HORUS agent..."
wget -q https://github.com/your-repo/horus-agent/releases/download/v${AGENT_VERSION}/horus-agent-linux -O /tmp/horus-agent
chmod +x /tmp/horus-agent

echo -e "${YELLOW}[2/5]${NC} Creating directories..."
mkdir -p $CONFIG_DIR
mkdir -p /var/log/horus

echo -e "${YELLOW}[3/5]${NC} Installing agent..."
cp /tmp/horus-agent $INSTALL_DIR/horus-agent
chmod +x $INSTALL_DIR/horus-agent

echo -e "${YELLOW}[4/5]${NC} Creating configuration..."
cat > $CONFIG_DIR/agent_config.yml << EOF
server:
  url: $SERVER_URL
  api_key: ${API_KEY:-""}
agent:
  id: auto
  hostname: auto
  
log_sources:
  - type: auditd
    enabled: true
    path: /var/log/audit/audit.log
  
  - type: system
    enabled: true
buffer:
  max_events: 1000
  flush_interval: 30
EOF

echo -e "${YELLOW}[5/5]${NC} Creating systemd service..."
cat > /etc/systemd/system/horus-agent.service << EOF
[Unit]
Description=HORUS SIEM Agent
After=network.target

[Service]
Type=simple
User=root
ExecStart=$INSTALL_DIR/horus-agent --config $CONFIG_DIR/agent_config.yml
Restart=always
RestartSec=10
StandardOutput=append:/var/log/horus/agent.log
StandardError=append:/var/log/horus/agent-error.log

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable horus-agent
systemctl start horus-agent

echo -e "\n${GREEN}==================================${NC}"
echo -e "${GREEN}  Installation Complete!${NC}"
echo -e "${GREEN}==================================${NC}"
echo -e "\nAgent installed and started successfully!"
echo -e "\nUseful commands:"
echo -e "  ${YELLOW}Status:${NC}  systemctl status horus-agent"
echo -e "  ${YELLOW}Logs:${NC}    journalctl -u horus-agent -f"
echo -e "  ${YELLOW}Stop:${NC}    systemctl stop horus-agent"
echo -e "  ${YELLOW}Restart:${NC} systemctl restart horus-agent"
echo -e "\nConfiguration file: $CONFIG_DIR/agent_config.yml"
echo -e "Log file: /var/log/horus/agent.log\n"


