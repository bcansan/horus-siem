import React, { useEffect, useState } from 'react'

const API_URL = (import.meta as any).env?.VITE_API_URL || '/api/v1'

export default function App() {
  const [health, setHealth] = useState('...')

  useEffect(() => {
    fetch(`${API_URL}/ingest/health`).then(r => r.json()).then(d => setHealth(d.status || 'unknown')).catch(() => setHealth('down'))
  }, [])

  return (
    <div className="min-h-screen p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">HORUS SIEM/SOC</h1>
        <p className="text-sm text-gray-400">Estado backend: <span className="font-mono">{health}</span></p>
      </header>
      <main className="grid gap-6 md:grid-cols-2">
        <section className="rounded border border-gray-800 p-4">
          <h2 className="mb-2 text-xl font-semibold">Búsqueda rápida</h2>
          <p className="text-gray-400">Interfaz de ejemplo. Implementar vistas y gráficos.</p>
        </section>
        <section className="rounded border border-gray-800 p-4">
          <h2 className="mb-2 text-xl font-semibold">Alertas</h2>
          <p className="text-gray-400">Listado de alertas (pendiente).</p>
        </section>
      </main>
    </div>
  )
}


