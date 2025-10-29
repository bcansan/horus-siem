import React from 'react'

export default function AlertActions({ onAcknowledge, onResolve }: { onAcknowledge: () => void; onResolve: () => void }) {
  return (
    <div className="flex gap-2">
      <button onClick={onAcknowledge} className="rounded-md border border-slate-700 px-3 py-1 text-sm hover:bg-slate-800">Acknowledge</button>
      <button onClick={onResolve} className="rounded-md bg-green-600 px-3 py-1 text-sm font-semibold text-white hover:bg-green-500">Resolve</button>
    </div>
  )
}


