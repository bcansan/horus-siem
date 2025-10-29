import React from 'react'

export default function AlertDetail({ alert }: { alert: any }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
      <div className="text-lg font-semibold">{alert?.title || 'Alert Detail'}</div>
      <pre className="mt-3 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-300">{JSON.stringify(alert, null, 2)}</pre>
    </div>
  )
}


