import { useEffect, useRef, useMemo, useState } from 'react'
import * as d3 from 'd3'
import type { DataRow } from '../types'

interface Props {
  data: DataRow[]
}

const TIPOLOGI_QUAD: Record<string, { x: number; y: number }> = {
  'Wisatawan Budaya sebagai Tujuan Utama': { x: 0.75, y: 0.75 },
  'Wisatawan Budaya Kebetulan': { x: 0.25, y: 0.75 },
  'Wisatawan Budaya Insidental': { x: 1 / 6, y: 0.25 },
  'Wisatawan Budaya Kasual': { x: 3 / 6, y: 0.25 },
  'Wisatawan Budaya untuk Pemandangan': { x: 5 / 6, y: 0.25 },
}

// Orange = mancanegara, Blue = domestik
const CATEGORY_COLOR: Record<string, string> = {
  'mancanegara': '#f57c00',
  'domestik': '#1565c0',
}

const LEGEND_ITEMS = [
  { label: 'Wisatawan Mancanegara', color: '#f57c00' },
  { label: 'Wisatawan Domestik', color: '#1565c0' },
]

interface BubbleNode {
  tipologi: string
  category: string
  location: string
  count: number
  tx: number; ty: number; x: number; y: number; r: number
}

export function TipologiCategoryPlot({ data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedLocation, setSelectedLocation] = useState<string>('all')

  const locations = useMemo(() =>
    [...new Set(data.map(r => r['Location']).filter(Boolean))].sort()
    , [data])

  const bubbles = useMemo(() => {
    const groups: Record<string, { tipologi: string; category: string; location: string; count: number }> = {}
    data.forEach(r => {
      const tipologi = r['Tipologi Wisatawan']?.trim()
      const category = r['Tourist Category']?.toLowerCase().trim()
      const location = r['Location']?.trim() || '(Unknown)'
      if (!TIPOLOGI_QUAD[tipologi]) return
      if (selectedLocation !== 'all' && location !== selectedLocation) return
      const key = `${tipologi}||${category}||${location}`
      if (!groups[key]) groups[key] = { tipologi, category, location, count: 0 }
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
          category: g.category,
          location: g.location,
          count: chunk,
          // Ini akan diisi di useEffect
          tx: 0, ty: 0, x: 0, y: 0, r: 0
        });
        remaining -= chunk;
      }
    });

    return result;
  }, [data, selectedLocation])

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

    const cy = innerH / 2
    const topDivX = innerW / 2
    const botDiv1 = innerW / 3
    const botDiv2 = (innerW * 2) / 3

    // Left border (Y axis)
    root.append('line')
      .attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', innerH)
      .attr('stroke', '#333').attr('stroke-width', 2.5)

    // Bottom border (X axis)
    root.append('line')
      .attr('x1', 0).attr('y1', innerH).attr('x2', innerW).attr('y2', innerH)
      .attr('stroke', '#333').attr('stroke-width', 2.5)

    // Horizontal divider
    root.append('line')
      .attr('x1', 0).attr('y1', cy).attr('x2', innerW).attr('y2', cy)
      .attr('stroke', '#777').attr('stroke-width', 2)

    // Top vertical divider @50%
    root.append('line')
      .attr('x1', topDivX).attr('y1', 0).attr('x2', topDivX).attr('y2', cy)
      .attr('stroke', '#777').attr('stroke-width', 2)

    // Bottom vertical dividers @1/3 and @2/3
    root.append('line')
      .attr('x1', botDiv1).attr('y1', cy).attr('x2', botDiv1).attr('y2', innerH)
      .attr('stroke', '#777').attr('stroke-width', 2)
    root.append('line')
      .attr('x1', botDiv2).attr('y1', cy).attr('x2', botDiv2).attr('y2', innerH)
      .attr('stroke', '#777').attr('stroke-width', 2)

    // Axis labels
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

    // Section labels
    const pad = 10
    const sections = [
      { lines: ['Wisatawan Budaya Kebetulan'], ax: pad, ay: pad, anchor: 'start' },
      { lines: ['Wisatawan Budaya sebagai', 'Tujuan Utama'], ax: innerW - pad, ay: pad, anchor: 'end' },
      { lines: ['Wisatawan Budaya', 'Isidental'], ax: pad, ay: innerH - 24, anchor: 'start' },
      { lines: ['Wisatawan Budaya Kasual'], ax: innerW / 2, ay: innerH - 24, anchor: 'middle' },
      { lines: ['Wisatawan Budaya untuk', 'Pemandangan'], ax: innerW - pad, ay: innerH - 24, anchor: 'end' },
    ]

    sections.forEach(({ lines, ax, ay, anchor }) => {
      const g = root.append('g').attr('transform', `translate(${ax},${ay})`)
      lines.forEach((line, i) => {
        g.append('text')
          .attr('y', i * 13).attr('text-anchor', anchor as any)
          .attr('font-size', 11).attr('fill', '#555').attr('font-weight', 'bold')
          .text(line)
      })
    })

    // Bubble scale
    const maxCount = d3.max(bubbles, b => b.count) ?? 1
    // Atur ukuran agar max radius tidak terlalu besar karena banyak bubble
    const rScale = d3.scaleSqrt().domain([1, Math.max(50, maxCount)]).range([4, 20])

    function getClampX(t: string): [number, number] {
      if (t === 'Wisatawan Budaya Kebetulan') return [0, topDivX]
      if (t === 'Wisatawan Budaya sebagai Tujuan Utama') return [topDivX, innerW]
      if (t === 'Wisatawan Budaya Insidental') return [0, botDiv1]
      if (t === 'Wisatawan Budaya Kasual') return [botDiv1, botDiv2]
      if (t === 'Wisatawan Budaya untuk Pemandangan') return [botDiv2, innerW]
      return [0, innerW]
    }
    function getClampY(t: string): [number, number] {
      return ['Wisatawan Budaya sebagai Tujuan Utama', 'Wisatawan Budaya Kebetulan'].includes(t)
        ? [0, cy] : [cy, innerH]
    }

    const nodes: BubbleNode[] = bubbles.map(b => {
      const q = TIPOLOGI_QUAD[b.tipologi]
      const tx = q.x * innerW
      const ty = (1 - q.y) * innerH
      const r = rScale(b.count)
      return { ...b, tx, ty, r, x: tx + (Math.random() - 0.5) * 40, y: ty + (Math.random() - 0.5) * 40 }
    })

    const sim = d3.forceSimulation(nodes as any)
      .force('x', d3.forceX((d: any) => d.tx).strength(0.15))
      .force('y', d3.forceY((d: any) => d.ty).strength(0.15))
      .force('collide', d3.forceCollide((d: any) => d.r + 1.5).strength(0.9))
      .stop()
    for (let i = 0; i < 300; i++) sim.tick()

    nodes.forEach((n: any) => {
      const [xMin, xMax] = getClampX(n.tipologi)
      const [yMin, yMax] = getClampY(n.tipologi)
      n.x = Math.max(xMin + n.r + 1, Math.min(xMax - n.r - 1, n.x))
      n.y = Math.max(yMin + n.r + 1, Math.min(yMax - n.r - 1, n.y))
    })

    root.selectAll<SVGCircleElement, BubbleNode>('circle.bubble')
      .data(nodes)
      .join('circle')
      .attr('class', 'bubble')
      .attr('cx', d => d.x).attr('cy', d => d.y).attr('r', d => d.r)
      .attr('fill', d => CATEGORY_COLOR[d.category] ?? '#888')
      .attr('fill-opacity', 0.80)
      .attr('stroke', '#fff').attr('stroke-width', 1.4)

    // Legend: category color
    const legX = margin.left + innerW + 20
    const leg = d3.select(svg).append('g').attr('transform', `translate(${legX},${margin.top + 50})`)

    LEGEND_ITEMS.forEach(({ label, color }, i) => {
      const g = leg.append('g').attr('transform', `translate(0,${i * 36})`)
      g.append('circle').attr('r', 11).attr('cx', 11).attr('cy', 0)
        .attr('fill', color).attr('fill-opacity', 0.82).attr('stroke', '#fff').attr('stroke-width', 1.5)
      g.append('text').attr('x', 28).attr('y', 4).attr('font-size', 11.5).attr('fill', '#333').text(label)
    })



  }, [bubbles])

  const locationName = selectedLocation === 'all' ? 'Semua Lokasi' : selectedLocation

  return (
    <div className="scatter-card">
      <div className="scatter-header">
        <div>
          <h2 className="scatter-title">Tipologi Wisatawan</h2>
          <p className="scatter-subtitle">({locationName})</p>
        </div>
        <div className="scatter-controls">
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
        </div>
      </div>

      <div className="scatter-wrap" ref={containerRef}>
        <svg ref={svgRef} style={{ display: 'block', width: '100%' }} />
      </div>
    </div>
  )
}
