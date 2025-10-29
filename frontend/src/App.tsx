import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import DashboardPage from './pages/DashboardPage'
import SearchPage from './pages/SearchPage'
import AlertsPage from './pages/AlertsPage'
import RulesPage from './pages/RulesPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<DashboardPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}


