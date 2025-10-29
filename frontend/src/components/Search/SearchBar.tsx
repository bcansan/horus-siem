import React from 'react'

export default function SearchBar({ value, onChange, onSubmit }: { value: string; onChange: (v: string) => void; onSubmit: () => void }) {
  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-blue-500"
        placeholder="Consulta (query_string)"
      />
      <button onClick={onSubmit} className="rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500">Buscar</button>
    </div>
  )
}


