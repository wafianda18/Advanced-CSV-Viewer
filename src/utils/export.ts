import * as XLSX from 'xlsx'
import type { DataRow } from '../types'

export function exportToExcel(filteredData: DataRow[]) {
  const groups: Record<string, DataRow[]> = { Museum: [], Kebudayaan: [], Candi: [] }
  filteredData.forEach((r) => {
    if (groups[r._src]) groups[r._src].push(r)
  })

  const wb = XLSX.utils.book_new()
  const headers = [
    'User Location','Review Text','Language','Location','Tourist Category',
    'Faktor Penarik','Faktor Pendorong','Pengalaman Pasif','Pengalaman Aktif',
    'Pengalaman Flow','Tipologi Wisatawan','Tingkatan Kepuasan','Validasi',
  ]

  Object.entries(groups).forEach(([sheetName, rows]) => {
    if (!rows.length) return
    const sheetData = [
      [sheetName],
      headers,
      ...rows.map((r) => headers.map((h) => (r as Record<string, string>)[h] || '')),
    ]
    const ws = XLSX.utils.aoa_to_sheet(sheetData)
    ws['!cols'] = [12,8,8,25,12,30,25,18,18,22,35,18,10].map((w) => ({ wch: w }))
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  })

  const allHeaders = ['Sumber', ...headers]
  const allData = [
    allHeaders,
    ...filteredData.map((r) => [r._src, ...headers.map((h) => (r as Record<string, string>)[h] || '')]),
  ]
  const wsAll = XLSX.utils.aoa_to_sheet(allData)
  wsAll['!cols'] = [12, ...headers.map(() => ({ wch: 18 }))].map((v) =>
    typeof v === 'number' ? { wch: v } : v
  )
  XLSX.utils.book_append_sheet(wb, wsAll, 'Semua Data')

  const filename = `export_${new Date().toISOString().slice(0, 10)}_${filteredData.length}rows.xlsx`
  XLSX.writeFile(wb, filename)
}
