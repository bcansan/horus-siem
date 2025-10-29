import React from 'react'

export type RecentEvent = {
  id: string
  message: string
  ts: string
  source?: string
}

export default function RecentEvents({ events }: { events: RecentEvent[] }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
      <div className="mb-3 text-sm text-slate-400">Eventos recientes</div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400">
              <th className="px-2 py-2">Fecha</th>
              <th className="px-2 py-2">Mensaje</th>
              <th className="px-2 py-2">Fuente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {events.map(e => (
              <tr key={e.id} className="hover:bg-slate-800/50">
                <td className="px-2 py-2 text-xs text-slate-400">{e.ts}</td>
                <td className="px-2 py-2">{e.message}</td>
                <td className="px-2 py-2 text-slate-300">{e.source || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


