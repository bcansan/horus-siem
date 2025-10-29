import React, { useState } from 'react'
import SearchBar from '../components/Search/SearchBar'
import Filters from '../components/Search/Filters'
import ResultsTable from '../components/Search/ResultsTable'
import { search } from '../services/api'

export default function SearchPage() {
  const [query, setQuery] = useState('*')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const runSearch = async () => {
    setLoading(true)
    try {
      const res = await search(query)
      setItems(res?.hits?.hits || [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <SearchBar value={query} onChange={setQuery} onSubmit={runSearch} />
      <Filters />
      {loading ? <div className="text-slate-400">Buscando…</div> : <ResultsTable items={items} />}
    </div>
  )
}


