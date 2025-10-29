import React from 'react'

export default function StatsCard({ title, value, subtitle, accent = 'blue' }: { title: string; value: string | number; subtitle?: string; accent?: 'blue' | 'green' | 'amber' | 'red' }) {
  const accentMap = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    amber: 'text-amber-400',
    red: 'text-red-400'
  } as const
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
      <div className="text-sm text-slate-400">{title}</div>
      <div className={`mt-2 text-3xl font-bold ${accentMap[accent]}`}>{value}</div>
      {subtitle && <div className="mt-1 text-xs text-slate-500">{subtitle}</div>}
    </div>
  )
}


