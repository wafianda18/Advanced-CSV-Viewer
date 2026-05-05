import { useEffect, useRef, useMemo, useState } from 'react'
import * as d3 from 'd3'
import type { DataRow } from '../types'

interface Props {
  data: DataRow[]
}

/**
 * Layout (sesuai gambar):
 *
 *  ┌──────────────────┬──────────────────────────────┐
 *  │  Kebetulan       │  sebagai Tujuan Utama        │  ← top half (2 cols, divider @50%)
 *  ├────────┬─────────┴──────────┬───────────────────┤
 *  │Isidental│  Kasual           │  untuk Pemandangan │  ← bot half (3 cols, dividers @33%,67%)
 *  └────────┴───────────────────┴───────────────────┘
 */

// Tipologi → normalised anchor (x = Motivasi, y = Pengalaman)
// Top half: 2 cols → centers at x=0.25 (left) and x=0.75 (right)
// Bot half: 3 cols → centers at x=1/6, x=1/2, x=5/6
const TIPOLOGI_QUAD: Record<string, { x: number; y: number }> = {
  'Wisatawan Budaya sebagai Tujuan Utama': { x: 0.75, y: 0.75 },
  'Wisatawan Budaya Kebetulan': { x: 0.25, y: 0.75 },
  'Wisatawan Budaya Insidental': { x: 1 / 6, y: 0.25 },
  'Wisatawan Budaya Kasual': { x: 3 / 6, y: 0.25 },
  'Wisatawan Budaya untuk Pemandangan': { x: 5 / 6, y: 0.25 },
}

const KEPUASAN_COLOR: Record<string, string> = {
  'Puas': '#4caf50',
  'Netral': '#f5a623',
  'Tidak Puas': '#e53935',
  'Tidak Terklasifikasi': '#9e9e9e',
}

const LEGEND_ITEMS = [
  { label: 'Puas', color: '#4caf50' },
  { label: 'Netral', color: '#f5a623' },
  { label: 'Tidak Puas', color: '#e53935' },
  { label: 'Tidak Terklasifikasi', color: '#9e9e9e' },
]

type FilterMode = 'all' | 'mancanegara' | 'domestik'

interface BubbleNode {
  tipologi: string
  kepuasan: string
  location: string
  count: number
  tx: number
  ty: number
  x: number
  y: number
  r: number
}

export function TipologiScatterPlot({ data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')

  const locations = useMemo(() =>
    [...new Set(data.map(r => r['Location']).filter(Boolean))].sort()
    , [data])

  // Aggregate → one bubble per (tipologi × kepuasan × location)
  const bubbles = useMemo(() => {
    const groups: Record<string, { tipologi: string; kepuasan: string; location: string; count: number }> = {}
    data.forEach(r => {
      const tipologi = r['Tipologi Wisatawan']?.trim()
      const kepuasan = r['Tingkatan Kepuasan']?.trim()
      const location = r['Location']?.trim() || '(Unknown)'
      const category = r['Tourist Category']?.toLowerCase().trim()

      if (!TIPOLOGI_QUAD[tipologi]) return
      if (filterMode === 'mancanegara' && category !== 'mancanegara') return
      if (filterMode === 'domestik' && category !== 'domestik') return
      if (selectedLocation !== 'all' && location !== selectedLocation) return

      const key = `${tipologi}||${kepuasan}||${location}`
      if (!groups[key]) groups[key] = { tipologi, kepuasan, location, count: 0 }
      groups[key].count++
    })

    const result: BubbleNode[] = []

    // Pecah data yang besar menjadi banyak bulatan (kelipatan 50 atau sisa)
    const CHUNK_SIZE = 50;

    Object.values(groups).forEach(g => {
      let remaining = g.count;
      while (remaining > 0) {
        const chunk = Math.min(remaining, CHUNK_SIZE);
        result.push({
          tipologi: g.tipologi,
          kepuasan: g.kepuasan,
          location: g.location,
          count: chunk,
          // Ini akan diisi di useEffect
          tx: 0, ty: 0, x: 0, y: 0, r: 0
        });
        remaining -= chunk;
      }
    });

    return result;
  }, [data, filterMode, selectedLocation])

  const totalCount = useMemo(() => bubbles.reduce((s, b) => s + b.count, 0), [bubbles])

  useEffect(() => {
    const svg = svgRef.current
    const container = containerRef.current
    if (!svg || !container) return

    const W = container.clientWidth || 860
    const H = Math.min(Math.round(W * 0.68), 580)
    const margin = { top: 40, right: 190, bottom: 56, left: 58 }
    const innerW = W - margin.left - margin.right
    const innerH = H - margin.top - margin.bottom

    d3.select(svg).selectAll('*').remove()
    svg.setAttribute('width', String(W))
    svg.setAttribute('height', String(H))
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)

    const root = d3.select(svg)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // ── Grid lines ──────────────────────────────────────────────
    const cy = innerH / 2   // horizontal divider

    // Outer border
    root.append('rect')
      .attr('x', 0).attr('y', 0)
      .attr('width', innerW).attr('height', innerH)
      .attr('fill', 'none').attr('stroke', '#bbb').attr('stroke-width', 1)

    // Horizontal divider (top/bottom half)
    root.append('line')
      .attr('x1', 0).attr('y1', cy).attr('x2', innerW).attr('y2', cy)
      .attr('stroke', '#999').attr('stroke-width', 1.2).attr('stroke-dasharray', '5,4')

    // Top half: 1 vertical divider @ 50%
    const topDivX = innerW / 2
    root.append('line')
      .attr('x1', topDivX).attr('y1', 0)
      .attr('x2', topDivX).attr('y2', cy)
      .attr('stroke', '#999').attr('stroke-width', 1.2).attr('stroke-dasharray', '5,4')

    // Bottom half: 2 vertical dividers @ 1/3 and 2/3
    const botDiv1X = innerW / 3
    const botDiv2X = (innerW * 2) / 3
    root.append('line')
      .attr('x1', botDiv1X).attr('y1', cy)
      .attr('x2', botDiv1X).attr('y2', innerH)
      .attr('stroke', '#999').attr('stroke-width', 1.2).attr('stroke-dasharray', '5,4')
    root.append('line')
      .attr('x1', botDiv2X).attr('y1', cy)
      .attr('x2', botDiv2X).attr('y2', innerH)
      .attr('stroke', '#999').attr('stroke-width', 1.2).attr('stroke-dasharray', '5,4')

    // ── Axis labels ──────────────────────────────────────────────
    root.append('text')
      .attr('x', innerW / 2).attr('y', innerH + 44)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13).attr('font-weight', '700').attr('fill', '#333')
      .text('Motivasi')

    root.append('text')
      .attr('transform', `translate(-42,${innerH / 2}) rotate(-90)`)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13).attr('font-weight', '700').attr('fill', '#333')
      .text('Pengalaman')

    // ── Section labels (placed at bottom of each section) ─────────
    const pad = 10
    const sectionLabels = [
      // Top row
      {
        lines: ['Wisatawan Budaya Kebetulan'],
        ax: pad, ay: pad, anchor: 'start',
      },
      {
        lines: ['Wisatawan Budaya sebagai', 'Tujuan Utama'],
        ax: innerW - pad, ay: pad, anchor: 'end',
      },
      // Bottom row
      {
        lines: ['Wisatawan Budaya', 'Isidental'],
        ax: pad, ay: innerH - 24, anchor: 'start',
      },
      {
        lines: ['Wisatawan Budaya Kasual'],
        ax: innerW / 2, ay: innerH - 24, anchor: 'middle',
      },
      {
        lines: ['Wisatawan Budaya untuk', 'Pemandangan'],
        ax: innerW - pad, ay: innerH - 24, anchor: 'end',
      },
    ]

    sectionLabels.forEach(({ lines, ax, ay, anchor }) => {
      const g = root.append('g').attr('transform', `translate(${ax},${ay})`)
      lines.forEach((line, i) => {
        g.append('text')
          .attr('y', i * 13)
          .attr('text-anchor', anchor as any)
          .attr('font-size', 10)
          .attr('fill', '#888')
          .attr('font-style', 'italic')
          .text(line)
      })
    })

    // ── Bubble scale ─────────────────────────────────────────────
    const maxCount = d3.max(bubbles, b => b.count) ?? 1
    const rScale = d3.scaleSqrt()
      .domain([1, Math.max(50, maxCount)])
      .range([4, 20])

    // Clamp boundaries per section
    // Top: two sections (0..topDivX) and (topDivX..innerW)
    // Bot: three sections split at botDiv1X and botDiv2X
    function getClampX(tipologi: string): [number, number] {
      if (tipologi === 'Wisatawan Budaya Kebetulan') return [0, topDivX]
      if (tipologi === 'Wisatawan Budaya sebagai Tujuan Utama') return [topDivX, innerW]
      if (tipologi === 'Wisatawan Budaya Insidental') return [0, botDiv1X]
      if (tipologi === 'Wisatawan Budaya Kasual') return [botDiv1X, botDiv2X]
      if (tipologi === 'Wisatawan Budaya untuk Pemandangan') return [botDiv2X, innerW]
      return [0, innerW]
    }
    function getClampY(tipologi: string): [number, number] {
      const isTop = ['Wisatawan Budaya sebagai Tujuan Utama', 'Wisatawan Budaya Kebetulan'].includes(tipologi)
      return isTop ? [0, cy] : [cy, innerH]
    }

    // Build nodes
    const nodes: BubbleNode[] = bubbles.map(b => {
      const q = TIPOLOGI_QUAD[b.tipologi]
      const tx = q.x * innerW
      const ty = (1 - q.y) * innerH
      const r = rScale(b.count)
      return {
        ...b, tx, ty, r,
        x: tx + (Math.random() - 0.5) * 40,
        y: ty + (Math.random() - 0.5) * 40,
      }
    })

    // Force simulation — cluster to anchor, avoid collisions
    const sim = d3.forceSimulation(nodes as any)
      .force('x', d3.forceX((d: any) => d.tx).strength(0.15))
      .force('y', d3.forceY((d: any) => d.ty).strength(0.15))
      .force('collide', d3.forceCollide((d: any) => d.r + 1.5).strength(0.9))
      .stop()

    for (let i = 0; i < 300; i++) sim.tick()

    // Clamp each node within its section bounds
    nodes.forEach((n: any) => {
      const [xMin, xMax] = getClampX(n.tipologi)
      const [yMin, yMax] = getClampY(n.tipologi)
      n.x = Math.max(xMin + n.r + 1, Math.min(xMax - n.r - 1, n.x))
      n.y = Math.max(yMin + n.r + 1, Math.min(yMax - n.r - 1, n.y))
    })

    // Draw bubbles
    root.selectAll<SVGCircleElement, BubbleNode>('circle.bubble')
      .data(nodes)
      .join('circle')
      .attr('class', 'bubble')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.r)
      .attr('fill', d => KEPUASAN_COLOR[d.kepuasan] ?? '#9e9e9e')
      .attr('fill-opacity', 0.82)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.4)

    // ── Right legend: color ──────────────────────────────────────
    const legX = margin.left + innerW + 20
    const leg = d3.select(svg).append('g')
      .attr('transform', `translate(${legX},${margin.top + 36})`)

    leg.append('text')
      .attr('y', -16)
      .attr('font-size', 8.5).attr('font-weight', '700').attr('fill', '#999')
      .attr('letter-spacing', '1')
      .text('KEPUASAN')

    LEGEND_ITEMS.forEach(({ label, color }, i) => {
      const g = leg.append('g').attr('transform', `translate(0,${i * 30})`)
      g.append('circle')
        .attr('r', 8).attr('cx', 8).attr('cy', 0)
        .attr('fill', color).attr('fill-opacity', 0.82)
        .attr('stroke', '#fff').attr('stroke-width', 1.2)
      g.append('text')
        .attr('x', 22).attr('y', 4)
        .attr('font-size', 11).attr('fill', '#444')
        .text(label)
    })



  }, [bubbles])

  const locationName = selectedLocation === 'all' ? 'Semua Lokasi' : selectedLocation
  const categoryLabel =
    filterMode === 'all' ? 'Mancanegara / Domestik'
      : filterMode === 'mancanegara' ? 'Mancanegara' : 'Domestik'

  return (
    <div className="scatter-card">
      <div className="scatter-header">
        <div>
          <h2 className="scatter-title">
            Kepuasan Tipologi Wisatawan ({categoryLabel})
          </h2>
          <p className="scatter-subtitle">({locationName})</p>
        </div>

        <div className="scatter-controls">
          <div className="scatter-ctrl-group">
            <span className="scatter-ctrl-label">Kategori Wisatawan</span>
            <div className="scatter-btn-group">
              {(['all', 'mancanegara', 'domestik'] as FilterMode[]).map(m => (
                <button
                  key={m}
                  className={`scatter-btn ${filterMode === m ? 'active' : ''}`}
                  onClick={() => setFilterMode(m)}
                >
                  {m === 'all' ? 'Semua' : m === 'mancanegara' ? 'Mancanegara' : 'Domestik'}
                </button>
              ))}
            </div>
          </div>

          <div className="scatter-ctrl-group">
            <span className="scatter-ctrl-label">Lokasi</span>
            <select
              className="scatter-select"
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
            >
              <option value="all">Semua Lokasi</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* <div className="scatter-count">
            <span className="scatter-count-num">{totalCount.toLocaleString('id-ID')}</span>
            <span className="scatter-count-label"> data · {bubbles.length} bubble</span>
          </div> */}
        </div>
      </div>

      <div className="scatter-wrap" ref={containerRef}>
        <svg ref={svgRef} style={{ display: 'block', width: '100%' }} />
      </div>
    </div>
  )
}
