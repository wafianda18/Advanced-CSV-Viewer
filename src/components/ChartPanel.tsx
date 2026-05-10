import { useState } from 'react'
import type { DataRow } from '../types'
import { TipologiScatterPlot } from './TipologiScatterPlot'
import { TipologiCategoryPlot } from './TipologiCategoryPlot'

interface Props {
  data: DataRow[]
}

type ChartTab = 'kepuasan' | 'kategori'

const TABS: { id: ChartTab; label: string; icon: string; desc: string }[] = [
  {
    id: 'kategori',
    icon: '🌐',
    label: 'Tipologi per Kategori',
    desc: 'Perbandingan wisatawan Mancanegara dan Domestik per tipologi wisatawan',
  },
  {
    id: 'kepuasan',
    icon: '📊',
    label: 'Kepuasan Tipologi',
    desc: 'Distribusi kepuasan (Puas / Netral / Tidak Puas) per tipologi wisatawan',
  },
]

export function ChartPanel({ data }: Props) {
  const [activeTab, setActiveTab] = useState<ChartTab>('kategori')

  return (
    <div className="chart-panel">
      {/* Tab switcher */}
      <div className="chart-tabs">
        <div className="chart-tabs-label">Pilih Visualisasi</div>
        <div className="chart-tabs-inner">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`chart-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="chart-tab-icon">{tab.icon}</span>
              <span className="chart-tab-content">
                <span className="chart-tab-label">{tab.label}</span>
                <span className="chart-tab-desc">{tab.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart content */}
      <div className="chart-panel-body">
        {activeTab === 'kepuasan' && <TipologiScatterPlot data={data} />}
        {activeTab === 'kategori' && <TipologiCategoryPlot data={data} />}
      </div>
    </div>
  )
}
