import React from 'react'

export default function RulesList({ rules, onSelect }: { rules: any[]; onSelect: (r: any) => void }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900">
      <ul className="divide-y divide-slate-800">
        {rules.map((r, idx) => (
          <li key={idx} className="cursor-pointer px-3 py-2 hover:bg-slate-800/50" onClick={() => onSelect(r)}>
            <div className="text-sm font-semibold">{r.name || r.id}</div>
            <div className="text-xs text-slate-500">{r.description || ''}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}


