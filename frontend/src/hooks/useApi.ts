import { useEffect, useState } from 'react'

export function useApi<T>(fn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  useEffect(() => {
    let alive = true
    setLoading(true)
    fn().then(d => { if (alive) setData(d) }).catch(e => { if (alive) setError(e) }).finally(() => alive && setLoading(false))
    return () => { alive = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return { data, error, loading }
}


