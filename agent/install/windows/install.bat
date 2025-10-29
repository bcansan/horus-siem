@echo off
setlocal enabledelayedexpansion

set TARGET=%ProgramFiles%\HORUS\agent
mkdir "%TARGET%" 2>nul
copy /Y ..\..\horus_agent.py "%TARGET%" >nul
copy /Y ..\..\agent_config.yml.example "%TARGET%\agent_config.yml" >nul

echo To run agent (requires Python):
echo   python "%TARGET%\horus_agent.py"


