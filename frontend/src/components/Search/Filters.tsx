import React from 'react'

export default function Filters() {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-700 bg-slate-900 p-3 text-sm">
      <div className="text-slate-400">Filtros (placeholder)</div>
      <button className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800">Última hora</button>
      <button className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800">Últimas 24h</button>
      <button className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800">Últimos 7d</button>
    </div>
  )
}


