# HORUS Agent - Windows Installation Script
# Run as Administrator
param(
    [string]$ServerUrl,
    [string]$ApiKey = ""
)

$ErrorActionPreference = "Stop"
$AgentVersion = "1.0.0"
$InstallDir = "C:\Program Files\HORUS"
$ConfigFile = "$InstallDir\agent_config.yml"

Write-Host "==================================" -ForegroundColor Green
Write-Host "  HORUS Agent Installation" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) { Write-Host "ERROR: Please run as Administrator" -ForegroundColor Red; exit 1 }

if (-not $ServerUrl) { $ServerUrl = Read-Host "Enter HORUS Server URL" }
if (-not $ApiKey) { $ApiKey = Read-Host "Enter API Key (optional, press Enter to skip)" }

Write-Host "`n[1/5] Downloading HORUS agent..." -ForegroundColor Yellow
$downloadUrl = "https://github.com/your-repo/horus-agent/releases/download/v$AgentVersion/horus-agent-windows.exe"
Invoke-WebRequest -Uri $downloadUrl -OutFile "$env:TEMP\horus-agent.exe"

Write-Host "[2/5] Creating installation directory..." -ForegroundColor Yellow
New-Item -Path $InstallDir -ItemType Directory -Force | Out-Null

Write-Host "[3/5] Installing agent..." -ForegroundColor Yellow
Copy-Item "$env:TEMP\horus-agent.exe" -Destination "$InstallDir\horus-agent.exe"

Write-Host "[4/5] Creating configuration..." -ForegroundColor Yellow
$config = @"
server:
  url: $ServerUrl
  api_key: $ApiKey
agent:
  id: auto
  hostname: auto
  
log_sources:
  - type: sysmon
    enabled: true
    path: 'Microsoft-Windows-Sysmon/Operational'
  
  - type: system
    enabled: true
buffer:
  max_events: 1000
  flush_interval: 30
"@
$config | Out-File -FilePath $ConfigFile -Encoding utf8

Write-Host "[5/5] Creating Windows service..." -ForegroundColor Yellow
if (Get-Service -Name "HORUSAgent" -ErrorAction SilentlyContinue) {
    Stop-Service -Name "HORUSAgent" -Force
    Start-Sleep -Seconds 2
    sc.exe delete "HORUSAgent" | Out-Null
    Start-Sleep -Seconds 2
}
New-Service -Name "HORUSAgent" `
    -BinaryPathName "`"$InstallDir\horus-agent.exe`" --config `"$ConfigFile`"" `
    -DisplayName "HORUS SIEM Agent" `
    -Description "Agent for HORUS Security Information and Event Management" `
    -StartupType Automatic
Start-Service -Name "HORUSAgent"

Write-Host "`n==================================" -ForegroundColor Green
Write-Host "  Installation Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host "`nAgent installed and started successfully!" -ForegroundColor Green
Write-Host "`nUseful commands:"
Write-Host "  Status:  " -NoNewline; Write-Host "Get-Service -Name HORUSAgent" -ForegroundColor Yellow
Write-Host "  Logs:    " -NoNewline; Write-Host "Get-EventLog -LogName Application -Source HORUSAgent -Newest 50" -ForegroundColor Yellow
Write-Host "  Stop:    " -NoNewline; Write-Host "Stop-Service -Name HORUSAgent" -ForegroundColor Yellow
Write-Host "  Restart: " -NoNewline; Write-Host "Restart-Service -Name HORUSAgent" -ForegroundColor Yellow
Write-Host "`nConfiguration file: $ConfigFile"
Write-Host ""


