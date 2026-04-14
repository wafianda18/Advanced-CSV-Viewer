import * as XLSX from 'xlsx'
import type { DataRow } from '../types'

type RowRecord = Record<string, string>

export function exportToExcel(filteredData: DataRow[]) {
  const groups: Record<string, DataRow[]> = { Museum: [], Kebudayaan: [], Candi: [] }
  filteredData.forEach((r) => {
    if (groups[r._src]) groups[r._src].push(r)
  })

  const wb = XLSX.utils.book_new()
  const dataHeaders: (keyof DataRow)[] = [
    'User Location', 'Review Text', 'Location', 'Tourist Category',
    'Faktor Penarik', 'Faktor Pendorong', 'Pengalaman Pasif', 'Pengalaman Aktif',
    'Pengalaman Flow', 'Tipologi Wisatawan', 'Tingkatan Kepuasan',
  ]
  const headerLabels = dataHeaders.map(String)

  Object.entries(groups).forEach(([sheetName, rows]) => {
    if (!rows.length) return
    const sheetData = [
      [sheetName],
      headerLabels,
      ...rows.map((r) => [
        ...dataHeaders.map((h) => (r as RowRecord)[h as string] || ''),
      ]),
    ]
    const ws = XLSX.utils.aoa_to_sheet(sheetData)
    ws['!cols'] = [12,25,12,30,25,18,18,22,35,18,10].map((w) => ({ wch: w }))
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  })

  const allData = [
    ['Sumber', ...headerLabels],
    ...filteredData.map((r) => [
      r._src,
      ...dataHeaders.map((h) => (r as RowRecord)[h as string] || ''),
    ]),
  ]
  const wsAll = XLSX.utils.aoa_to_sheet(allData)
  wsAll["!cols"] = [
    { wch: 12 },
    ...headerLabels.map(() => ({ wch: 18 })),
  ];

  XLSX.utils.book_append_sheet(wb, wsAll, 'Semua Data')

  XLSX.writeFile(wb, `export_${new Date().toISOString().slice(0, 10)}_${filteredData.length}rows.xlsx`)
}
