import React from 'react'

export default function RuleCard({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
      <div className="text-sm font-semibold">{title}</div>
      {description && <div className="mt-1 text-xs text-slate-400">{description}</div>}
    </div>
  )
}


