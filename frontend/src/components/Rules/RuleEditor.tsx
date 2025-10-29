import React, { useState } from 'react'

export default function RuleEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [text, setText] = useState(value)
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-2">
      <textarea
        value={text}
        onChange={e => { setText(e.target.value); onChange(e.target.value) }}
        className="h-72 w-full resize-none rounded-md border border-slate-700 bg-slate-950 p-2 text-xs outline-none"
      />
    </div>
  )
}


