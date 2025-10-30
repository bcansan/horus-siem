import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Search, Bell, Settings, Book, Workflow, Server, Shield, Download } from 'lucide-react'

const navItem = (
  to: string,
  label: string,
  Icon: React.ComponentType<any>
) => (
  <NavLink
    key={to}
    to={to}
    className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
      isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
    }`}
  >
    <Icon size={18} />
    <span>{label}</span>
  </NavLink>
)

export default function Sidebar() {
  return (
    <aside className="h-full w-64 shrink-0 border-r border-slate-700 bg-slate-900 p-3">
      <div className="mb-4 px-2 py-3 text-xl font-bold">HORUS</div>
      <nav className="flex flex-col gap-1">
        {navItem('/', 'Dashboard', LayoutDashboard)}
        {navItem('/search', 'Search', Search)}
        {navItem('/alerts', 'Alerts', Bell)}
        {navItem('/agents', 'Agents', Server)}
        {navItem('/agents/deploy', 'Deploy Agent', Download)}
        {navItem('/threat-intel', 'Threat Intel', Shield)}
        {navItem('/rules', 'Rules', Workflow)}
        {navItem('/settings', 'Settings', Settings)}
        {navItem('/docs', 'Docs', Book)}
      </nav>
    </aside>
  )
}


