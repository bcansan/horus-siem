export function openRealtime(path: string, onMessage: (data: any) => void) {
  const urlBase = (import.meta as any).env?.VITE_WS_URL || (typeof window !== 'undefined' ? `${window.location.origin.replace('http', 'ws')}` : 'ws://localhost:8000')
  const ws = new WebSocket(`${urlBase}${path}`)
  ws.onmessage = (ev) => {
    try { onMessage(JSON.parse(ev.data)) } catch { onMessage(ev.data) }
  }
  return ws
}


