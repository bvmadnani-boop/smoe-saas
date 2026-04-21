'use client'

import { useState } from 'react'
import SwotBoard from './SwotBoard'
import PestelTable from './PestelTable'
import InterestedPartiesTable from './InterestedPartiesTable'

type SwotItem   = { id: string; quadrant: string; content: string; is_active: boolean }
type PestelItem = { id: string; dimension: string; content: string; impact: string; is_active: boolean }
type Party      = { id: string; name: string; category: string; group_key: string | null; needs: string | null; expectations: string | null; influence_level: string; interest_level: string; is_active: boolean }

const TABS = [
  { key: 'swot',    label: 'SWOT',                 desc: 'Forces · Faiblesses · Opportunités · Menaces' },
  { key: 'pestel',  label: 'PESTEL',               desc: '6 dimensions de l\'environnement externe' },
  { key: 'parties', label: 'Parties intéressées',  desc: '§4.2 — Besoins et attentes' },
]

export default function ContextTabs({
  orgId,
  swotItems,
  pestelItems,
  parties,
}: {
  orgId: string
  swotItems: SwotItem[]
  pestelItems: PestelItem[]
  parties: Party[]
}) {
  const [tab, setTab] = useState('swot')

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-white text-[#1B3A6B] shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Sub-header */}
      <p className="text-xs text-slate-400 mb-4">
        {TABS.find(t => t.key === tab)?.desc}
      </p>

      {/* Content */}
      {tab === 'swot'    && <SwotBoard orgId={orgId} items={swotItems} />}
      {tab === 'pestel'  && <PestelTable orgId={orgId} items={pestelItems} />}
      {tab === 'parties' && <InterestedPartiesTable orgId={orgId} parties={parties} />}
    </div>
  )
}
