import type { Filters } from '../types'

interface Props {
  filters: Filters
  onChange: (f: Filters) => void
  onReset: () => void
}

function Select({
  label, value, options, onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div className="filter-group">
      <label>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={value ? 'active' : ''}
      >
        <option value="">Semua {label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

export function FilterPanel({ filters, onChange, onReset }: Props) {
  const set = (key: keyof Filters) => (val: string | boolean) =>
    onChange({ ...filters, [key]: val })

  return (
    <div className="filter-card">
      <div className="filter-title">Filter Data</div>
      <div className="filter-grid">
        <Select
          label="Sumber Data"
          value={filters.src}
          onChange={set("src")}
          options={[
            { value: "Museum", label: "Museum" },
            { value: "Kebudayaan", label: "Kebudayaan" },
            { value: "Candi", label: "Candi" },
          ]}
        />
        <Select
          label="Lokasi"
          value={filters.location}
          onChange={set("location")}
          options={[
            "Fort Vredeburg Museum",
            "Ijo Temple",
            "Imogiri Kings Cemetery",
            "Jogja National Museum",
            "Mataram Kings Cemetery Kotagede",
            "Museum Sonobudoyo",
            "Museum Ullen Sentalu",
            "Plaosan Temple",
            "Prambanan Temple Admission Ticket",
            "Prambanan Temples",
            "Ramayana Ballet at Prambanan",
            "Ramayana Ballet at Prambanan Admission Ticket",
            "Ratu Boko Temple",
            "Ratu Boko Temple Admission Ticket",
            "The Sambisari Temple",
            "Ullen Sentalu Museum Experience",
            "Water Castle (Tamansari)",
            "Yogyakarta Monument",
            "Yogyakarta Palace",
          ].map((v) => ({ value: v, label: v }))}
        />
        <Select
          label="Kategori Wisatawan"
          value={filters.category}
          onChange={set("category")}
          options={[
            { value: "domestik", label: "Domestik" },
            { value: "mancanegara", label: "Mancanegara" },
          ]}
        />
        <Select
          label="Faktor Penarik"
          value={filters.penarik}
          onChange={set("penarik")}
          options={[
            "Ketertarikan Budaya",
            "Ketertarikan Fasilitas",
            "Ketertarikan Suasana",
          ].map((v) => ({ value: v, label: v }))}
        />
        <Select
          label="Faktor Pendorong"
          value={filters.pendorong}
          onChange={set("pendorong")}
          options={[
            "Keinginan untuk belajar",
            "Keinginan untuk menjelajah",
            "Merencanakan perjalanan",
          ].map((v) => ({ value: v, label: v }))}
        />
        <Select
          label="Pengalaman Pasif"
          value={filters.pasif}
          onChange={set("pasif")}
          options={[
            { value: "Estetika", label: "Estetika" },
            { value: "Hiburan", label: "Hiburan" },
          ]}
        />
        <Select
          label="Pengalaman Aktif"
          value={filters.aktif}
          onChange={set("aktif")}
          options={[
            { value: "Edukasi", label: "Edukasi" },
            { value: "Pelarian", label: "Pelarian" },
          ]}
        />
        <Select
          label="Pengalaman Flow"
          value={filters.flow}
          onChange={set("flow")}
          options={[
            "Keterlibatan penuh",
            "Distorsi waktu",
            "Kesadaran diri",
          ].map((v) => ({ value: v, label: v }))}
        />
        <Select
          label="Tipologi Wisatawan"
          value={filters.tipologi}
          onChange={set("tipologi")}
          options={[
            "Wisatawan Budaya Kasual",
            "Wisatawan Budaya Insidental",
            "Wisatawan Budaya untuk Pemandangan",
            "Wisatawan Budaya Kebetulan",
            "Wisatawan Budaya sebagai Tujuan Utama",
            "Tipologi tidak terklasifikasi",
          ].map((v) => ({ value: v, label: v }))}
        />
        <Select
          label="Tingkatan Kepuasan"
          value={filters.kepuasan}
          onChange={set("kepuasan")}
          options={[
            { value: "Puas", label: "Puas" },
            { value: "Netral", label: "Netral" },
            { value: "Tidak Puas", label: "Tidak Puas" },
            { value: "Tidak Terklasifikasi", label: "Tidak Terklasifikasi" },
          ]}
        />
      </div>
      <div className="filter-actions">
        <button className="btn btn-secondary" onClick={onReset}>
          ↺ Reset Filter
        </button>
      </div>
    </div>
  );
}
