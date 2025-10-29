#!/bin/bash
set -e
python3 -m pip install --upgrade pip
pip install -r requirements.txt pyinstaller
pyinstaller -F horus_agent.py -n horus-agent
echo "Agente compilado en dist/horus-agent"


