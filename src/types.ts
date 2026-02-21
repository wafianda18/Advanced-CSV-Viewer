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
  [key: string]: string  // ← index signature, fixes TS2352 in export.ts
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
  noYogya: boolean
}

export const EMPTY_FILTERS: Filters = {
  src: '', lang: '', location: '', category: '',
  penarik: '', pendorong: '', pasif: '', aktif: '',
  flow: '', tipologi: '', kepuasan: '', noYogya: false,
}

export const YOGYA_LOCATIONS = new Set([
  'Jogja National Museum',
  'Yogyakarta Palace',
  'Yogyakarta Monument',
])

export const PAGE_SIZE = 50
