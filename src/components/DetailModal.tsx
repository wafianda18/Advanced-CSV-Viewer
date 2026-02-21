import { DataRow } from '../types'

interface Props {
  row: DataRow | null
  onClose: () => void
}

const FIELDS: { key: keyof DataRow; label: string }[] = [
  { key: "_src", label: "Sumber Data" },
  { key: "Review Text", label: "Review Text" },
  { key: "Location", label: "Lokasi" },
  { key: "language", label: "Bahasa" },
  { key: "userLocation", label: "User Location" },
  { key: "category", label: "Kategori Wisatawan" },
  { key: "penarik", label: "Faktor Penarik" },
  { key: "pendorong", label: "Faktor Pendorong" },
  { key: "pasif", label: "Pengalaman Pasif" },
  { key: "aktif", label: "Pengalaman Aktif" },
  { key: "flow", label: "Pengalaman Flow" },
  { key: "tipologi", label: "Tipologi Wisatawan" },
  { key: "kepuasan", label: "Tingkatan Kepuasan" },
  { key: "validasi", label: "Validasi" },
];

export function DetailModal({ row, onClose }: Props) {
  if (!row) return null

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3 className="modal-title">{row.location || 'Detail Review'}</h3>
        <div className="modal-fields">
          {FIELDS.map(({ key, label }) => (
            <div key={key} className="modal-field">
              <span className="modal-field-label">{label}</span>
              <p className="modal-field-value">{row[key] || '—'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
