import React, { useEffect, useState } from 'react'
import AlertCard from '../components/Alerts/AlertCard'
import AlertDetail from '../components/Alerts/AlertDetail'
import AlertActions from '../components/Alerts/AlertActions'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [selected, setSelected] = useState<any | null>(null)

  useEffect(() => {
    // Placeholder data
    setAlerts([
      { id: 'a1', title: 'Suspicious PowerShell', severity: 'high', description: 'Encoded command detected' },
      { id: 'a2', title: 'Brute force attempt', severity: 'medium' }
    ])
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2">
        {alerts.map(a => (
          <div key={a.id} onClick={() => setSelected(a)} className="cursor-pointer">
            <AlertCard title={a.title} severity={a.severity} description={a.description} />
          </div>
        ))}
      </div>
      <div className="md:col-span-2 space-y-3">
        {selected ? (
          <>
            <AlertDetail alert={selected} />
            <AlertActions onAcknowledge={() => {}} onResolve={() => {}} />
          </>
        ) : (
          <div className="rounded border border-slate-700 bg-slate-900 p-4 text-slate-400">Selecciona una alerta</div>
        )}
      </div>
    </div>
  )
}


