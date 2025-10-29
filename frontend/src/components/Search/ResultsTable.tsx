import React from 'react'

export default function ResultsTable({ items }: { items: any[] }) {
  return (
    <div className="overflow-auto rounded-md border border-slate-700">
      <table className="w-full text-sm">
        <thead className="bg-slate-900 text-left text-slate-400">
          <tr>
            <th className="px-3 py-2">@timestamp</th>
            <th className="px-3 py-2">message</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {items.map((hit, idx) => (
            <tr key={idx} className="hover:bg-slate-800/50">
              <td className="px-3 py-2 text-xs text-slate-400">{hit._source?.['@timestamp'] || '-'}</td>
              <td className="px-3 py-2">{hit._source?.message || JSON.stringify(hit._source)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


