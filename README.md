# Yogyakarta Cultural Tourism — Advanced CSV Viewer

Vite + React app untuk filter dan export data wisata budaya Yogyakarta (13.000+ rows).

## 📁 Struktur Project

```
csv-viewer/
├── public/
│   └── data/
│       └── data.json          ← DATA UTAMA (13.121 rows, ~11MB)
├── src/
│   ├── components/
│   │   ├── FilterPanel.tsx    ← 11 filter + checkbox
│   │   ├── StatsBar.tsx       ← statistik + tombol export
│   │   └── DataTable.tsx      ← tabel + pagination + modal
│   ├── hooks/
│   │   └── useData.ts         ← fetch data.json
│   ├── utils/
│   │   ├── filter.ts          ← logika filter
│   │   └── export.ts          ← export ke Excel (.xlsx)
│   ├── types.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
├── tsconfig.json
├── vercel.json
└── package.json
```

## 🚀 Cara Jalankan Lokal

```bash
npm install
npm run dev
```

Buka http://localhost:5173

## 📦 Deploy ke Vercel

### Cara 1 — Lewat GitHub (Recommended)

1. Push project ke GitHub:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/USERNAME/REPO.git
   git push -u origin main
   ```

2. Buka [vercel.com](https://vercel.com) → Import Git Repository
3. Pilih repo kamu
4. Settings sudah otomatis terdeteksi:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Klik **Deploy** → selesai!

### Cara 2 — Vercel CLI

```bash
npm i -g vercel
vercel
```

Ikuti petunjuknya, lalu `vercel --prod` untuk production.

## ⚠️ Catatan

- File `public/data/data.json` (~11MB) akan di-serve sebagai static file oleh Vercel CDN
- Data di-fetch sekali saat halaman pertama dibuka, lalu semua filter berjalan di browser (client-side)
- Export Excel menggunakan library `xlsx` — berjalan 100% di browser, tidak butuh server
