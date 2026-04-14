import type { DataRow, Filters } from '../types'

function matchField(rowVal: string, filterVal: string): boolean {
  if (!filterVal) return true
  if (!rowVal) return false
  const parts = rowVal.split(',').map((p) => p.trim().toLowerCase())
  return parts.some((p) => p === filterVal.toLowerCase() || p.includes(filterVal.toLowerCase()))
}

export function applyFilters(data: DataRow[], filters: Filters): DataRow[] {
  return data.filter((r) => {
    if (filters.src && r._src !== filters.src) return false
    if (filters.location && r.Location !== filters.location) return false
    if (filters.category && r['Tourist Category'] !== filters.category) return false
    if (filters.penarik && !matchField(r['Faktor Penarik'], filters.penarik)) return false
    if (filters.pendorong && !matchField(r['Faktor Pendorong'], filters.pendorong)) return false
    if (filters.pasif && !matchField(r['Pengalaman Pasif'], filters.pasif)) return false
    if (filters.aktif && !matchField(r['Pengalaman Aktif'], filters.aktif)) return false
    if (filters.tipologi && !matchField(r['Tipologi Wisatawan'], filters.tipologi)) return false
    if (filters.kepuasan && r['Tingkatan Kepuasan'] !== filters.kepuasan) return false
    return true
  })
}
