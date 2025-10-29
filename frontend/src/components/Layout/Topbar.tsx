import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'

export default function Topbar() {
  const navigate = useNavigate()
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-700 bg-slate-900/80 px-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/search')}
          className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-slate-300 hover:text-white"
        >
          <Search size={16} />
          <span>Search logs…</span>
        </button>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded-md p-2 text-slate-300 hover:text-white">
          <Bell size={18} />
          <span className="absolute right-1 top-1 inline-flex h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        <div className="text-sm text-slate-300">admin@horus</div>
      </div>
    </header>
  )
}


