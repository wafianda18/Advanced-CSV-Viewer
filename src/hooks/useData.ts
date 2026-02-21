import { useState, useEffect } from 'react'
import type { DataRow } from '../types'

interface UseDataReturn {
  data: DataRow[]
  loading: boolean
  error: string | null
}

export function useData(): UseDataReturn {
  const [data, setData] = useState<DataRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/data/data.json')
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat data')
        return res.json()
      })
      .then((json: DataRow[]) => {
        setData(json)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return { data, loading, error }
}
