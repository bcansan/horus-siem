import React from 'react'

export default function AlertCard({ title, severity, description }: { title: string; severity: 'low' | 'medium' | 'high'; description?: string }) {
  const color = severity === 'high' ? 'border-red-500 text-red-400' : severity === 'medium' ? 'border-amber-500 text-amber-400' : 'border-slate-600 text-slate-300'
  return (
    <div className={`rounded-lg border bg-slate-900 p-4 ${color}`}>
      <div className="text-sm font-semibold">{title}</div>
      {description && <div className="mt-1 text-sm text-slate-400">{description}</div>}
    </div>
  )
}


