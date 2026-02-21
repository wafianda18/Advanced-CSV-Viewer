import { useState, useMemo } from 'react'
import { DataRow, Filters, INITIAL_FILTERS } from '../types'
import { filterData } from '../utils/filter'

export function useFilters(data: DataRow[]) {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 50

  const filtered = useMemo(() => filterData(data, filters), [data, filters])

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  function resetFilters() {
    setFilters(INITIAL_FILTERS)
    setPage(1)
  }

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const stats = useMemo(() => ({
    museum: filtered.filter(r => r.src === 'Museum').length,
    kebudayaan: filtered.filter(r => r.src === 'Kebudayaan').length,
    candi: filtered.filter(r => r.src === 'Candi').length,
  }), [filtered])

  return { filters, updateFilter, resetFilters, filtered, pageData, page, setPage, totalPages, PAGE_SIZE, stats }
}
