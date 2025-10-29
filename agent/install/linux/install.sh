#!/bin/bash
set -e

INSTALL_DIR=/opt/horus-agent
sudo mkdir -p $INSTALL_DIR
sudo cp -f ../../horus_agent.py $INSTALL_DIR/
sudo cp -f ../../agent_config.yml.example $INSTALL_DIR/agent_config.yml

cat <<SERVICE | sudo tee /etc/systemd/system/horus-agent.service >/dev/null
[Unit]
Description=HORUS Agent
After=network-online.target

[Service]
ExecStart=/usr/bin/python3 /opt/horus-agent/horus_agent.py
Restart=always
User=root

[Install]
WantedBy=multi-user.target
SERVICE

sudo systemctl daemon-reload
sudo systemctl enable horus-agent
sudo systemctl start horus-agent
echo "HORUS Agent instalado y ejecutándose."


