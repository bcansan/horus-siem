import React from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex min-w-0 grow flex-col">
        <Topbar />
        <main className="min-h-0 grow p-4">{children}</main>
      </div>
    </div>
  )
}


