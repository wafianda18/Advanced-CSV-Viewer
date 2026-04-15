import type { DataRow } from '../types'

interface Props {
  row: DataRow | null
  onClose: () => void
}

const FIELDS: { key: keyof DataRow; label: string }[] = [
  { key: "_src", label: "Sumber Data" },
  { key: "Review Text", label: "Review Text" },
  { key: "Language", label: "Bahasa" },
  { key: "Location", label: "Lokasi" },
  { key: "User Location", label: "User Location" },
  { key: "Tourist Category", label: "Kategori Wisatawan" },
  { key: "Faktor Penarik", label: "Faktor Penarik" },
  { key: "Faktor Pendorong", label: "Faktor Pendorong" },
  { key: "Pengalaman Pasif", label: "Pengalaman Pasif" },
  { key: "Pengalaman Aktif", label: "Pengalaman Aktif" },
  { key: "Tipologi Wisatawan", label: "Tipologi Wisatawan" },
  { key: "Tingkatan Kepuasan", label: "Tingkatan Kepuasan" },
  { key: "Validasi", label: "Validasi" },
];

export function DetailModal({ row, onClose }: Props) {
  if (!row) return null
  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3 className="modal-title">{row['Location'] || 'Detail Review'}</h3>
        {FIELDS.map(({ key, label }) => (
          <div key={key} className="modal-field">
            <label>{label}</label>
            <p>{row[key] || '—'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
