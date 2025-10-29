import React, { useMemo } from 'react'
import StatsCard from '../components/Dashboard/StatsCard'
import EventsChart from '../components/Dashboard/EventsChart'
import AlertsList from '../components/Dashboard/AlertsList'
import RecentEvents from '../components/Dashboard/RecentEvents'
import ThreatMap from '../components/Dashboard/ThreatMap'

export default function DashboardPage() {
  const chartData = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({ ts: `${i}m`, count: Math.floor(Math.random() * 100) })), [])
  const alerts = [
    { id: '1', title: 'Suspicious PowerShell', severity: 'high', time: 'hoy 12:03' },
    { id: '2', title: 'Multiple failed logins', severity: 'medium', time: 'hoy 11:51' }
  ]
  const events = Array.from({ length: 6 }).map((_, i) => ({ id: String(i), message: 'Heartbeat from agent', ts: new Date().toLocaleTimeString(), source: 'agent01' }))

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard title="Eventos (24h)" value={123456} subtitle="+12% vs ayer" accent="blue" />
        <StatsCard title="Alertas activas" value={27} subtitle="-2 desde ayer" accent="amber" />
        <StatsCard title="Agentes online" value={42} subtitle="4 desconectados" accent="green" />
        <StatsCard title="Reglas" value={58} subtitle="5 deshabilitadas" accent="red" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2"><EventsChart data={chartData} /></div>
        <AlertsList items={alerts as any} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <RecentEvents events={events as any} />
        <ThreatMap />
      </div>
    </div>
  )
}


