export interface DataRow {
  _src: 'Museum' | 'Kebudayaan' | 'Candi'
  'User Location': string
  'Review Text': string
  Language: string
  Location: string
  'Tourist Category': string
  'Faktor Penarik': string
  'Faktor Pendorong': string
  'Pengalaman Pasif': string
  'Pengalaman Aktif': string
  'Pengalaman Flow': string
  'Tipologi Wisatawan': string
  'Tingkatan Kepuasan': string
  Validasi: string
  [key: string]: string
}

export interface Filters {
  src: string
  lang: string
  location: string
  category: string
  penarik: string
  pendorong: string
  pasif: string
  aktif: string
  flow: string
  tipologi: string
  kepuasan: string
  validasi: string   // ← NEW
  noYogya: boolean
}

export const EMPTY_FILTERS: Filters = {
  src: '', lang: '', location: '', category: '',
  penarik: '', pendorong: '', pasif: '', aktif: '',
  flow: '', tipologi: '', kepuasan: '',
  validasi: '',      // ← NEW
  noYogya: false,
}

// Tipologi yang masuk lingkup validasi
export const VALIDASI_TIPOLOGI = new Set([
  'Wisatawan Budaya sebagai Tujuan Utama',
  'Wisatawan Budaya Kebetulan',
])

// Hitung status validasi sebuah baris
export function getValidasiStatus(row: DataRow): 'Valid' | 'Tidak Valid' | 'Di Luar Lingkup' {
  const tipologi = row['Tipologi Wisatawan']?.trim()
  const kepuasan = row['Tingkatan Kepuasan']?.trim()
  if (!VALIDASI_TIPOLOGI.has(tipologi)) return 'Di Luar Lingkup'
  if (kepuasan === 'Puas') return 'Valid'
  return 'Tidak Valid'
}

export const YOGYA_LOCATIONS = new Set([
  'Jogja National Museum',
  'Yogyakarta Palace',
  'Yogyakarta Monument',
])

export const PAGE_SIZE = 50
