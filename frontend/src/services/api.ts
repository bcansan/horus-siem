import axios from 'axios'

const baseURL = (import.meta as any).env?.VITE_API_URL || '/api/v1'

export const api = axios.create({ baseURL })

export async function getHealth() {
  const { data } = await api.get('/health')
  return data
}

export async function search(query: string) {
  const { data } = await api.get('/search', { params: { q: query } })
  return data
}

export async function listRules() {
  const { data } = await api.get('/rules')
  return data
}

export async function listAlerts() {
  const { data } = await api.get('/alerts')
  return data
}


