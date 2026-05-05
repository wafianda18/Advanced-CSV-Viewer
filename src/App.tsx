import { useState, useMemo, useCallback } from 'react'
import { useData } from './hooks/useData'
import { FilterPanel } from './components/FilterPanel'
import { StatsBar } from './components/StatsBar'
import { DataTable } from './components/DataTable'
import { TipologiScatterPlot } from './components/TipologiScatterPlot'
import { applyFilters } from './utils/filter'
import { exportToExcel } from './utils/export'
import { EMPTY_FILTERS } from './types'
import type { Filters } from './types'

export default function App() {
  const { data, loading, error } = useData()
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [exporting, setExporting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' } | null>(null)

  const filteredData = useMemo(() => applyFilters(data, filters), [data, filters])

  const showToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleReset = useCallback(() => {
    setFilters(EMPTY_FILTERS)
    showToast('Filter direset', 'info')
  }, [])

  const handleExport = useCallback(async () => {
    if (!filteredData.length) return
    setExporting(true)
    await new Promise((r) => setTimeout(r, 50))
    try {
      exportToExcel(filteredData)
      showToast(`Berhasil export ${filteredData.length.toLocaleString('id-ID')} baris!`)
    } catch (e) {
      showToast('Gagal export: ' + (e as Error).message, 'info')
    }
    setExporting(false)
  }, [filteredData])

  return (
    <div className="app">
      <header className="header">
        <div className="header-icon">🏛️</div>
        <div>
          <h1>Advanced CSV Viewer</h1>
          <p>Yogyakarta Cultural Tourism — Museum · Kebudayaan · Candi</p>
        </div>
        {!loading && (
          <div className="header-badge">{data.length.toLocaleString('id-ID')} data</div>
        )}
      </header>

      <main className="main">
        {error ? (
          <div className="error-state">
            <p>⚠️ {error}</p>
            <p className="error-hint">Pastikan file <code>public/data/data.json</code> ada di project.</p>
          </div>
        ) : (
          <>
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              onReset={handleReset}
              data={data}
            />
            <StatsBar
              total={data.length}
              filtered={filteredData}
              onExport={handleExport}
              exporting={exporting}
            />
            <TipologiScatterPlot data={filteredData} />
            <DataTable data={filteredData} loading={loading} />
          </>
        )}
      </main>

      {toast && (
        <div className={`toast toast-${toast.type} toast-show`}>
          {toast.type === 'success' ? '✓' : 'ℹ'} {toast.msg}
        </div>
      )}
    </div>
  )
}
