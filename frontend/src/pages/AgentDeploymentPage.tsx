import React, { useState } from 'react'
import { Download, Copy, Terminal, Server, CheckCircle } from 'lucide-react'

export const AgentDeploymentPage: React.FC = () => {
  const [selectedOS, setSelectedOS] = useState<'windows' | 'linux'>('linux')
  const [apiKey, setApiKey] = useState('')
  const [serverUrl, setServerUrl] = useState('http://10.0.2.33:8000')
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const generateAgentConfig = () => {
    return `server:
  url: ${serverUrl}
  api_key: ${apiKey || 'YOUR_API_KEY_HERE'}
agent:
  id: auto  # Se genera automáticamente
  hostname: auto  # Se detecta automáticamente
  
log_sources:
  - type: ${selectedOS === 'windows' ? 'sysmon' : 'auditd'}
    enabled: true
    ${selectedOS === 'windows' ? "path: 'Microsoft-Windows-Sysmon/Operational'" : 'path: /var/log/audit/audit.log'}
  
  - type: system
    enabled: true
buffer:
  max_events: 1000
  flush_interval: 30  # segundos
`
  }

  const linuxCommands = {
    download: `# Descargar el agente
wget https://github.com/tu-repo/horus-agent/releases/latest/download/horus-agent-linux -O /tmp/horus-agent
chmod +x /tmp/horus-agent`,
    config: `# Crear archivo de configuración
sudo mkdir -p /etc/horus
sudo tee /etc/horus/agent_config.yml > /dev/null << EOF
${generateAgentConfig()}
EOF`,
    install: `# Copiar binario
sudo cp /tmp/horus-agent /usr/local/bin/horus-agent
sudo chmod +x /usr/local/bin/horus-agent`,
    systemd: `# Crear servicio systemd
sudo tee /etc/systemd/system/horus-agent.service > /dev/null << EOF
[Unit]
Description=HORUS SIEM Agent
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/horus-agent --config /etc/horus/agent_config.yml
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
# Habilitar e iniciar el servicio
sudo systemctl daemon-reload
sudo systemctl enable horus-agent
sudo systemctl start horus-agent`,
    verify: `# Verificar estado del agente
sudo systemctl status horus-agent
# Ver logs
sudo journalctl -u horus-agent -f`,
    alternative: `# Instalación con script (alternativa)
curl -fsSL https://raw.githubusercontent.com/tu-repo/horus-agent/main/install.sh | sudo bash -s -- --server-url ${serverUrl} --api-key ${apiKey || 'YOUR_API_KEY'}`,
  }

  const windowsCommands = {
    download: `# Descargar el agente (PowerShell como Administrador)
Invoke-WebRequest -Uri "https://github.com/tu-repo/horus-agent/releases/latest/download/horus-agent-windows.exe" -OutFile "$env:TEMP\\horus-agent.exe"`,
    config: `# Crear archivo de configuración
$configPath = "C:\\Program Files\\HORUS\\agent_config.yml"
New-Item -Path "C:\\Program Files\\HORUS" -ItemType Directory -Force
@"
${generateAgentConfig()}
"@ | Out-File -FilePath $configPath -Encoding utf8`,
    install: `# Copiar ejecutable
Copy-Item "$env:TEMP\\horus-agent.exe" -Destination "C:\\Program Files\\HORUS\\horus-agent.exe"`,
    service: `# Crear servicio de Windows
New-Service -Name "HORUSAgent" \
  -BinaryPathName '"C:\\Program Files\\HORUS\\horus-agent.exe" --config "C:\\Program Files\\HORUS\\agent_config.yml"' \
  -DisplayName "HORUS SIEM Agent" \
  -Description "Agent for HORUS Security Information and Event Management" \
  -StartupType Automatic
# Iniciar el servicio
Start-Service -Name "HORUSAgent"`,
    verify: `# Verificar estado del servicio
Get-Service -Name "HORUSAgent"
# Ver logs del servicio
Get-EventLog -LogName Application -Source "HORUSAgent" -Newest 50`,
    alternative: `# Instalación con script (alternativa)
# Ejecutar PowerShell como Administrador y ejecutar:
Invoke-Expression (Invoke-WebRequest -Uri "https://raw.githubusercontent.com/tu-repo/horus-agent/main/install.ps1" -UseBasicParsing).Content -ServerUrl "${serverUrl}" -ApiKey "${apiKey || 'YOUR_API_KEY'}"`,
  }

  const dockerCommand = `# Desplegar agente con Docker\ndocker run -d \\\n  --name horus-agent \\\n  --restart always \\\n  -e HORUS_SERVER_URL="${serverUrl}" \\\n  -e HORUS_API_KEY="${apiKey || 'YOUR_API_KEY'}" \\\n  -v /var/log:/var/log:ro \\\n  -v /var/run/docker.sock:/var/run/docker.sock:ro \\\n  horus/agent:latest`

  const CommandBlock: React.FC<{ title: string; command: string; language?: string }> = ({ title, command, language = 'bash' }) => (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Terminal className="h-5 w-5 text-blue-400" />
          {title}
        </h3>
        <button onClick={() => handleCopy(command)} className="flex items-center gap-2 rounded bg-slate-700 px-3 py-1 text-slate-300 transition hover:bg-slate-600">
          {copied ? (<><CheckCircle className="h-4 w-4 text-green-400" /><span className="text-green-400">Copiado!</span></>) : (<><Copy className="h-4 w-4" /><span>Copiar</span></>)}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-900 p-4">
        <code className={`text-sm text-slate-300 language-${language}`}>{command}</code>
      </pre>
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold text-white">
          <Download className="h-8 w-8 text-blue-500" />
          Deploy HORUS Agent
        </h1>
        <p className="text-slate-400">Install the HORUS agent on your systems to start collecting security events</p>
      </div>

      <div className="mb-6 rounded-lg bg-slate-800 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
          <Server className="h-5 w-5 text-purple-500" />
          Configuration
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Server URL</label>
            <input className="w-full rounded-lg bg-slate-700 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500" value={serverUrl} onChange={e => setServerUrl(e.target.value)} placeholder="http://your-horus-server:8000" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">API Key (opcional)</label>
            <input type="password" className="w-full rounded-lg bg-slate-700 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="your-api-key-here" />
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-900/20 p-4">
          <p className="text-sm text-blue-300">💡 <strong>Tip:</strong> La API key es opcional para pruebas. En producción, genera una key única por agente desde la configuración.</p>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <button onClick={() => setSelectedOS('linux')} className={`flex-1 rounded-lg py-4 font-semibold transition ${selectedOS === 'linux' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>🐧 Linux</button>
        <button onClick={() => setSelectedOS('windows')} className={`flex-1 rounded-lg py-4 font-semibold transition ${selectedOS === 'windows' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>🪟 Windows</button>
      </div>

      <div className="rounded-lg bg-slate-800 p-6">
        <h2 className="mb-6 text-2xl font-bold text-white">Installation Instructions - {selectedOS === 'linux' ? 'Linux' : 'Windows'}</h2>
        {selectedOS === 'linux' ? (
          <>
            <div className="mb-8">
              <h3 className="mb-4 text-xl font-bold text-white">Prerequisites</h3>
              <ul className="list-inside list-disc space-y-2 text-slate-300">
                <li>Linux distribution (Ubuntu, Debian, CentOS, RHEL)</li>
                <li>Root or sudo privileges</li>
                <li>Network access to HORUS server</li>
                <li>Python 3.8+ (if building from source)</li>
              </ul>
            </div>
            <CommandBlock title="1. Download Agent" command={linuxCommands.download} />
            <CommandBlock title="2. Create Configuration" command={linuxCommands.config} />
            <CommandBlock title="3. Install Binary" command={linuxCommands.install} />
            <CommandBlock title="4. Create Systemd Service" command={linuxCommands.systemd} />
            <CommandBlock title="5. Verify Installation" command={linuxCommands.verify} />
            <div className="mt-8 rounded-lg border border-green-500/30 bg-green-900/20 p-4">
              <h4 className="mb-2 font-bold text-green-300">✅ Quick Install (One-liner)</h4>
              <CommandBlock title="" command={linuxCommands.alternative} />
            </div>
          </>
        ) : (
          <>
            <div className="mb-8">
              <h3 className="mb-4 text-xl font-bold text-white">Prerequisites</h3>
              <ul className="list-inside list-disc space-y-2 text-slate-300">
                <li>Windows 10/11 or Windows Server 2016+</li>
                <li>Administrator privileges</li>
                <li>PowerShell 5.1 or higher</li>
                <li>Network access to HORUS server</li>
                <li>Sysmon installed (recommended)</li>
              </ul>
            </div>
            <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-900/20 p-4">
              <p className="text-sm text-yellow-300">⚠️ <strong>Important:</strong> Run all commands in PowerShell as Administrator</p>
            </div>
            <CommandBlock title="1. Download Agent" command={windowsCommands.download} language="powershell" />
            <CommandBlock title="2. Create Configuration" command={windowsCommands.config} language="powershell" />
            <CommandBlock title="3. Install Executable" command={windowsCommands.install} language="powershell" />
            <CommandBlock title="4. Create Windows Service" command={windowsCommands.service} language="powershell" />
            <CommandBlock title="5. Verify Installation" command={windowsCommands.verify} language="powershell" />
            <div className="mt-8 rounded-lg border border-green-500/30 bg-green-900/20 p-4">
              <h4 className="mb-2 font-bold text-green-300">✅ Quick Install (One-liner)</h4>
              <CommandBlock title="" command={windowsCommands.alternative} language="powershell" />
            </div>
            <div className="mt-6 rounded-lg border border-blue-500/30 bg-blue-900/20 p-4">
              <h4 className="mb-2 font-bold text-blue-300">📥 Installing Sysmon (Recommended)</h4>
              <pre className="mt-2 overflow-x-auto rounded-lg border border-slate-700 bg-slate-900 p-4">
                <code className="text-sm text-slate-300">{`# Download Sysmon
Invoke-WebRequest -Uri "https://download.sysinternals.com/files/Sysmon.zip" -OutFile "$env:TEMP\\Sysmon.zip"
Expand-Archive -Path "$env:TEMP\\Sysmon.zip" -DestinationPath "$env:TEMP\\Sysmon"
# Install with default config
& "$env:TEMP\\Sysmon\\Sysmon64.exe" -accepteula -i`}</code>
              </pre>
            </div>
          </>
        )}

        <div className="mt-8">
          <h3 className="mb-4 text-xl font-bold text-white">🐳 Docker Deployment (Alternative)</h3>
          <p className="mb-4 text-slate-400">Deploy the agent as a Docker container on any platform</p>
          <CommandBlock title="Deploy with Docker" command={dockerCommand} />
        </div>

        <div className="mt-8 rounded-lg border border-slate-700 bg-slate-900 p-6">
          <h3 className="mb-4 text-xl font-bold text-white">🔧 Troubleshooting</h3>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-semibold text-white">Agent not connecting to server</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-slate-400">
                <li>Verify firewall rules allow outbound connections to {serverUrl}</li>
                <li>Check if the server URL is correct and accessible</li>
                <li>Ensure API key is valid (if configured)</li>
                <li>Review agent logs for error messages</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-white">No events being sent</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-slate-400">
                <li>Verify log sources are configured correctly</li>
                <li>Check file/event log permissions</li>
                <li>Ensure Sysmon is installed and running (Windows)</li>
                <li>Check auditd is active (Linux)</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-white">High CPU/Memory usage</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-slate-400">
                <li>Adjust buffer settings in configuration</li>
                <li>Reduce flush_interval for more frequent smaller batches</li>
                <li>Filter log sources to reduce volume</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-6">
          <h3 className="mb-4 text-xl font-bold text-white">🚀 Next Steps</h3>
          <ol className="list-inside list-decimal space-y-2 text-slate-300">
            <li>Deploy the agent on your target systems</li>
            <li>Check the <a href="/agents" className="underline decoration-blue-400 text-blue-400 hover:text-blue-300">Agents page</a> to verify connectivity</li>
            <li>Configure detection rules in the <a href="/rules" className="underline decoration-blue-400 text-blue-400 hover:text-blue-300">Rules section</a></li>
            <li>Monitor alerts in the <a href="/alerts" className="underline decoration-blue-400 text-blue-400 hover:text-blue-300">Alerts dashboard</a></li>
            <li>Review events in <a href="/search" className="underline decoration-blue-400 text-blue-400 hover:text-blue-300">Search</a></li>
          </ol>
        </div>
      </div>
    </div>
  )
}
