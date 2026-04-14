import { useState } from 'react'
import type { DataRow } from '../types'
import { PAGE_SIZE, getValidasiStatus } from '../types'

interface Props {
  data: DataRow[]
  loading: boolean
}

function MultiTags({ val }: { val: string }) {
  if (!val) return <span className="no-val">—</span>
  const parts = val.split(',').map((v) => v.trim()).filter(Boolean)
  return (
    <div className="tags-wrap">
      {parts.map((p, i) => <span key={i} className="tag tag-plain">{p}</span>)}
    </div>
  )
}

function SrcTag({ src }: { src: string }) {
  return <span className={`tag tag-src tag-src-${src}`}>{src}</span>
}

function CatTag({ cat }: { cat: string }) {
  return <span className={`tag tag-cat tag-cat-${cat}`}>{cat === 'domestik' ? 'Domestik' : 'Manca'}</span>
}

function KepuasanTag({ val }: { val: string }) {
  const cls: Record<string, string> = {
    Puas: 'tag-puas', Netral: 'tag-netral',
    'Tidak Puas': 'tag-tidakpuas', 'Tidak Terklasifikasi': 'tag-tk',
  }
  return <span className={`tag ${cls[val] || 'tag-tk'}`}>{val || '—'}</span>
}

function ModalDetail({ row, onClose }: { row: DataRow; onClose: () => void }) {
  const validasi = getValidasiStatus(row)
  const fields: [string, string][] = [
    ["Sumber Data", row._src],
    ["Lokasi", row.Location],
    ["Kategori", row["Tourist Category"]],
    ["Review Text", row["Review Text"]],
    ["Faktor Penarik", row["Faktor Penarik"]],
    ["Faktor Pendorong", row["Faktor Pendorong"]],
    ["Pengalaman Pasif", row["Pengalaman Pasif"]],
    ["Pengalaman Aktif", row["Pengalaman Aktif"]],
    ["Pengalaman Flow", row["Pengalaman Flow"]],
    ["Tipologi Wisatawan", row["Tipologi Wisatawan"]],
    ["Tingkatan Kepuasan", row["Tingkatan Kepuasan"]],
  ];
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <h3 className="modal-title">{row["Location"] || "Detail Review"}</h3>

        <div
          className={`modal-validasi modal-validasi-${validasi === "Valid" ? "valid" : validasi === "Tidak Valid" ? "invalid" : "diluar"}`}
        >
          <strong>Status Validasi:</strong>{" "}
          {validasi === "Valid"
            ? "✅ Valid"
            : validasi === "Tidak Valid"
              ? "❌ Tidak Valid"
              : "— Di Luar Lingkup"}
          {validasi !== "Di Luar Lingkup" && (
            <span className="modal-validasi-rule">
              {row["Tipologi Wisatawan"]} · {row["Tingkatan Kepuasan"]}
            </span>
          )}
        </div>

        {fields.map(([lbl, val]) => (
          <div key={lbl} className="modal-field">
            <label>{lbl}</label>
            {lbl === "Review Text" ? (
              <div className="modal-review-content">
                <p>{val || "—"}</p>
                <div className="modal-review-actions">
                  <a
                    href={`https://translate.google.com/?sl=auto&tl=id&text=${encodeURIComponent(val)}&op=translate`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="translate-link"
                  >
                    🌐 Terjemahkan Review
                  </a>
                </div>
              </div>
            ) : (
              <p>{val || "—"}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DataTable({ data, loading }: Props) {
  const [page, setPage] = useState(1)
  const [selectedRow, setSelectedRow] = useState<DataRow | null>(null)

  const totalPages = Math.ceil(data.length / PAGE_SIZE)
  const pageData = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const goPage = (p: number) => {
    if (p < 1 || p > totalPages) return
    setPage(p)
    document.querySelector('.table-scroll')?.scrollTo(0, 0)
  }

  const getPages = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | '...')[] = [1, 2]
    if (page > 4) pages.push('...')
    for (let i = Math.max(3, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) pages.push(i)
    if (page < totalPages - 3) pages.push('...')
    pages.push(totalPages - 1, totalPages)
    return [...new Set(pages)]
  }

  if (loading) {
    return (
      <div className="table-wrap">
        <div className="loading-state">
          <div className="spinner" />
          <p>Memuat 13.000+ data...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="table-wrap">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Sumber</th>
                <th>Lokasi</th>
                <th>Kat</th>
                <th>Review Text</th>
                <th>Faktor Penarik</th>
                <th>Faktor Pendorong</th>
                <th>Peng. Pasif</th>
                <th>Peng. Aktif</th>
                <th>Peng. Flow</th>
                <th>Tipologi</th>
                <th>Kepuasan</th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={12} className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <p>Tidak ada data yang sesuai filter</p>
                  </td>
                </tr>
              ) : (
                pageData.map((row, i) => (
                  <tr
                    key={(page - 1) * PAGE_SIZE + i}
                    onClick={() => setSelectedRow(row)}
                  >
                    <td className="td-num">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td>
                      <SrcTag src={row._src} />
                    </td>
                    <td className="td-location">{row.Location || "—"}</td>
                    <td>
                      <CatTag cat={row["Tourist Category"]} />
                    </td>
                    <td className="td-review">
                      <div className="review-clamp">{row["Review Text"]}</div>
                    </td>
                    <td>
                      <MultiTags val={row["Faktor Penarik"]} />
                    </td>
                    <td>
                      <MultiTags val={row["Faktor Pendorong"]} />
                    </td>
                    <td>
                      <MultiTags val={row["Pengalaman Pasif"]} />
                    </td>
                    <td>
                      <MultiTags val={row["Pengalaman Aktif"]} />
                    </td>
                    <td>
                      <MultiTags val={row["Pengalaman Flow"]} />
                    </td>
                    <td className="td-tipologi">
                      {row["Tipologi Wisatawan"] || "—"}
                    </td>
                    <td>
                      <KepuasanTag val={row["Tingkatan Kepuasan"]} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => goPage(page - 1)}
              disabled={page === 1}
            >
              ←
            </button>
            {getPages().map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} className="page-dots">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  className={`page-btn ${p === page ? "active" : ""}`}
                  onClick={() => goPage(p as number)}
                >
                  {p}
                </button>
              ),
            )}
            <button
              className="page-btn"
              onClick={() => goPage(page + 1)}
              disabled={page === totalPages}
            >
              →
            </button>
            <span className="page-info">
              {((page - 1) * PAGE_SIZE + 1).toLocaleString()}–
              {Math.min(page * PAGE_SIZE, data.length).toLocaleString()} dari{" "}
              {data.length.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {selectedRow && (
        <ModalDetail row={selectedRow} onClose={() => setSelectedRow(null)} />
      )}
    </>
  );
}
