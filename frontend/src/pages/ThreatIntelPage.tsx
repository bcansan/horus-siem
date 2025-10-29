import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Shield, Upload, AlertTriangle } from 'lucide-react'

export const ThreatIntelPage: React.FC = () => {
  const [iocs, setIocs] = useState<any[]>([])
  const [stats, setStats] = useState<any | null>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('all')

  useEffect(() => {
    loadIOCs(); loadStats(); loadMatches()
  }, [filterSeverity])

  const loadIOCs = async () => {
    try {
      const params: any = {}
      if (filterSeverity !== 'all') params.severity = filterSeverity
      const { data } = await axios.get('/api/v1/threat-intel/iocs', { params })
      setIocs(data.iocs || [])
    } catch (e) { console.error('Failed to load IOCs:', e) }
  }
  const loadStats = async () => {
    try {
      const { data } = await axios.get('/api/v1/threat-intel/stats')
      setStats(data)
    } catch (e) { console.error('Failed to load stats:', e) }
  }
  const loadMatches = async () => {
    try {
      const { data } = await axios.get('/api/v1/threat-intel/matches')
      setMatches(data.matches || [])
    } catch (e) { console.error('Failed to load matches:', e) }
  }

  const getSeverityColor = (s?: string) => {
    switch ((s||'').toLowerCase()) {
      case 'critical': return 'bg-red-600'
      case 'high': return 'bg-orange-600'
      case 'medium': return 'bg-yellow-600'
      case 'low': return 'bg-green-600'
      default: return 'bg-gray-600'
    }
  }

  const filteredIocs = iocs.filter(i => !searchTerm || String(i.ioc_value).toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
          <Shield className="h-8 w-8" />
          Threat Intelligence
        </h1>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
          <Upload className="h-4 w-4" />
          Import IOCs
        </button>
      </div>

      {stats && (
        <div className="mb-6 grid grid-cols-4 gap-4">
          <div className="rounded-lg bg-slate-800 p-4"><p className="mb-1 text-sm text-slate-400">Total IOCs</p><p className="text-3xl font-bold text-white">{stats.stats.total_iocs}</p></div>
          <div className="rounded-lg bg-slate-800 p-4"><p className="mb-1 text-sm text-slate-400">Critical IOCs</p><p className="text-3xl font-bold text-red-500">{stats.stats.critical_iocs}</p></div>
          <div className="rounded-lg bg-slate-800 p-4"><p className="mb-1 text-sm text-slate-400">Active IOCs</p><p className="text-3xl font-bold text-green-500">{stats.stats.active_iocs}</p></div>
          <div className="rounded-lg bg-slate-800 p-4"><p className="mb-1 text-sm text-slate-400">Matches (24h)</p><p className="text-3xl font-bold text-orange-500">{stats.matches_24h}</p></div>
        </div>
      )}

      {matches.length > 0 && (
        <div className="mb-6 rounded-lg bg-slate-800 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Recent Threat Matches (24h)
          </h2>
          <div className="space-y-3">
            {matches.slice(0,5).map((m: any) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg bg-slate-700 p-4">
                <div>
                  <p className="font-medium text-white">{m.ioc_value}</p>
                  <p className="text-sm text-slate-400">{m.threat_type} on {m.hostname}</p>
                </div>
                <span className={`rounded px-3 py-1 text-xs font-medium text-white ${getSeverityColor(m.severity)}`}>{m.severity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg bg-slate-800 p-6">
        <h2 className="mb-4 text-xl font-bold text-white">Indicators of Compromise</h2>
        <div className="mb-4 flex gap-4">
          <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search IOCs..." className="flex-1 rounded-lg bg-slate-700 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500" />
          <select value={filterSeverity} onChange={e=>setFilterSeverity(e.target.value)} className="rounded-lg bg-slate-700 px-4 py-2 text-white outline-none">
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-300">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-300">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-300">Threat Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-300">Severity</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-300">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-300">First Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredIocs.map((ioc: any) => (
                <tr key={ioc.id} className="hover:bg-slate-700/50">
                  <td className="px-4 py-3 text-sm uppercase text-slate-300">{ioc.ioc_type}</td>
                  <td className="px-4 py-3 font-mono text-sm text-white">{ioc.ioc_value}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{ioc.threat_type}</td>
                  <td className="px-4 py-3"><span className={`rounded px-2 py-1 text-xs font-medium text-white ${getSeverityColor(ioc.severity)}`}>{ioc.severity}</span></td>
                  <td className="px-4 py-3 text-sm text-slate-400">{ioc.source}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{ioc.first_seen && new Date(ioc.first_seen).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


