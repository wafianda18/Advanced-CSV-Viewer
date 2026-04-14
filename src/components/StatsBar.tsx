import type { DataRow } from '../types'

interface Props {
  total: number
  filtered: DataRow[]
  onExport: () => void
  exporting: boolean
}

export function StatsBar({ total, filtered, onExport, exporting }: Props) {
  const museum = filtered.filter((r) => r._src === 'Museum').length
  const kebud = filtered.filter((r) => r._src === 'Kebudayaan').length
  const candi = filtered.filter((r) => r._src === 'Candi').length

  const fmt = (n: number) => n.toLocaleString('id-ID')

  return (
    <div className="action-bar">
      <div className="stats">
        <div className="stat-badge">
          Total: <span className="stat-num">{fmt(total)}</span>
        </div>
        <div className="stat-badge">
          Filtered: <span className="stat-num">{fmt(filtered.length)}</span>
        </div>
        <div className="stat-badge src-breakdown">
          <span className="src-pill museum">{fmt(museum)}</span> Museum
          <span className="divider">·</span>
          <span className="src-pill kebud">{fmt(kebud)}</span> Kebudayaan
          <span className="divider">·</span>
          <span className="src-pill candi">{fmt(candi)}</span> Candi
        </div>
      </div>
      <button
        className="btn btn-gold"
        onClick={onExport}
        disabled={exporting || filtered.length === 0}
      >
        {exporting ? '⌛ Mengekspor...' : '⬇ Export Excel'}
      </button>
    </div>
  )
}
