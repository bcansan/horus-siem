import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Server, AlertCircle, CheckCircle, XCircle, Clock, Download } from 'lucide-react'
import { Link } from 'react-router-dom'

export const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([])
  const [stats, setStats] = useState<any | null>(null)
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAgents()
    loadStats()
    const interval = setInterval(() => { loadAgents(); loadStats() }, 30000)
    return () => clearInterval(interval)
  }, [filter])

  const loadAgents = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {}
      const { data } = await axios.get('/api/v1/agents', { params })
      setAgents(data)
    } catch (e) {
      console.error('Failed to load agents:', e)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const { data } = await axios.get('/api/v1/agents/stats/summary')
      setStats(data.summary)
    } catch (e) {
      console.error('Failed to load stats:', e)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'offline': return <XCircle className="w-5 h-5 text-red-500" />
      case 'error': return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default: return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-600'
      case 'offline': return 'bg-red-600'
      case 'error': return 'bg-yellow-600'
      default: return 'bg-gray-600'
    }
  }

  const formatLastSeen = (ts?: string) => {
    if (!ts) return 'Never'
    const date = new Date(ts)
    const diff = Math.floor((Date.now() - date.getTime()) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
          <Server className="h-8 w-8" />
          Agents
        </h1>
        <Link to="/agents/deploy" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
          <Download className="h-4 w-4" />
          Deploy New Agent
        </Link>
      </div>

      {stats && (
        <div className="mb-6 grid grid-cols-4 gap-4">
          <div className="rounded-lg bg-slate-800 p-4">
            <p className="mb-1 text-sm text-slate-400">Total Agents</p>
            <p className="text-3xl font-bold text-white">{stats.total_agents}</p>
          </div>
          <div className="rounded-lg bg-slate-800 p-4">
            <p className="mb-1 text-sm text-slate-400">Online</p>
            <p className="text-3xl font-bold text-green-500">{stats.online_agents}</p>
          </div>
          <div className="rounded-lg bg-slate-800 p-4">
            <p className="mb-1 text-sm text-slate-400">Offline</p>
            <p className="text-3xl font-bold text-red-500">{stats.offline_agents}</p>
          </div>
          <div className="rounded-lg bg-slate-800 p-4">
            <p className="mb-1 text-sm text-slate-400">Events (24h)</p>
            <p className="text-3xl font-bold text-blue-500">{(stats.total_events_24h || 0).toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="mb-6 flex gap-2">
        {(['all', 'online', 'offline'] as const).map(v => (
          <button key={v} onClick={() => setFilter(v)} className={`rounded-lg px-4 py-2 transition ${
            filter === v ? (v==='online'?'bg-green-600': v==='offline'?'bg-red-600':'bg-blue-600') + ' text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}>
            {v[0].toUpperCase()+v.slice(1)}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg bg-slate-800">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-300">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-300">Hostname</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-300">IP Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-300">OS</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-300">Version</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-300">Last Seen</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-300">Events (24h)</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {agents.map((agent: any) => (
              <tr key={agent.id} className="transition hover:bg-slate-700/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(agent.status)}
                    <span className={`rounded px-2 py-1 text-xs font-medium text-white ${getStatusColor(agent.status)}`}>{agent.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-white">{agent.hostname}</p>
                  <p className="text-sm text-slate-400">{agent.agent_name}</p>
                </td>
                <td className="px-6 py-4 font-mono text-sm text-slate-300">{agent.ip_address}</td>
                <td className="px-6 py-4 text-slate-300">{agent.os_type}</td>
                <td className="px-6 py-4 text-sm text-slate-400">{agent.agent_version}</td>
                <td className="px-6 py-4 text-sm text-slate-400">{formatLastSeen(agent.last_heartbeat)}</td>
                <td className="px-6 py-4 text-slate-300">{agent.total_events_24h || 0}</td>
                <td className="px-6 py-4">
                  <button className="text-sm text-blue-400 hover:text-blue-300">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


