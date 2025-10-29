import React from 'react'

export type AlertItem = {
  id: string
  title: string
  severity: 'low' | 'medium' | 'high'
  time: string
}

const sevColor = {
  low: 'text-slate-300',
  medium: 'text-amber-400',
  high: 'text-red-400'
} as const

export default function AlertsList({ items }: { items: AlertItem[] }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
      <div className="mb-3 text-sm text-slate-400">Alertas recientes</div>
      <ul className="divide-y divide-slate-800">
        {items.map(a => (
          <li key={a.id} className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm">{a.title}</div>
              <div className="text-xs text-slate-500">{a.time}</div>
            </div>
            <div className={`text-xs font-semibold ${sevColor[a.severity]}`.trim()}>{a.severity.toUpperCase()}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}


