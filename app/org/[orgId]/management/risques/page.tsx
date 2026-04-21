'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  RISK_CATEGORIES, RISK_STATUS_META, RISK_TREATMENT_META,
  getScoreLevel,
  type RiskType, type RiskCategory, type RiskStatus, type RiskTreatment,
} from '@/lib/risk-templates'
import RiskMatrix  from '@/components/org/qualite/RiskMatrix'
import RiskEditor  from '@/components/org/qualite/RiskEditor'
import RiskSeeder  from '@/components/org/qualite/RiskSeeder'
import { ArrowLeft, Plus, LayoutGrid, List, ShieldAlert, TrendingUp } from 'lucide-react'

interface Risk {
  id: string
  type: RiskType
  category: RiskCategory
  title: string
  description: string | null
  probability: number
  impact: number
  score: number
  treatment: RiskTreatment | null
  treatment_action: string | null
  owner: string | null
  status: RiskStatus
  version: number
}

export default function RisquesPage() {
  const params = useParams<{ orgId: string }>()
  const orgId  = params.orgId
  const supabase = createClient()

  const [risks,      setRisks]     = useState<Risk[]>([])
  const [loading,    setLoading]   = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editRisk,   setEditRisk]   = useState<Risk | null>(null)

  const [filterType,   setFilterType]   = useState<'all' | RiskType>('all')
  const [filterCat,    setFilterCat]    = useState<'all' | RiskCategory>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | RiskStatus>('all')
  const [view,         setView]         = useState<'list' | 'matrix'>('list')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('risks')
      .select('*')
      .eq('organization_id', orgId)
      .eq('is_active', true)
      .order('score', { ascending: false })
    setRisks((data ?? []) as Risk[])
    setLoading(false)
  }, [orgId])

  useEffect(() => { load() }, [load])

  const filtered = risks.filter(r => {
    if (filterType   !== 'all' && r.type     !== filterType)   return false
    if (filterCat    !== 'all' && r.category !== filterCat)    return false
    if (filterStatus !== 'all' && r.status   !== filterStatus) return false
    return true
  })

  const critiques = risks.filter(r => r.score >= 20 && r.type === 'risque').length
  const eleves    = risks.filter(r => r.score >= 12 && r.score < 20 && r.type === 'risque').length
  const risquesN  = risks.filter(r => r.type === 'risque').length
  const oppsN     = risks.filter(r => r.type === 'opportunite').length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link href={`/org/${orgId}/management`}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-1">
            <ArrowLeft size={13} /> Management
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Risques & Opportunités</h1>
          <p className="text-slate-500 mt-1 text-sm">ISO 21001 §6.1 — Registre des risques et matrice de criticité</p>
        </div>
        <button
          onClick={() => { setEditRisk(null); setShowEditor(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white
                     rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors"
        >
          <Plus size={16} /> Nouveau
        </button>
      </div>

      {/* Seeder si vide */}
      {!loading && risks.length === 0 && (
        <RiskSeeder orgId={orgId} onDone={load} />
      )}

      {/* KPIs */}
      {risks.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Risques critiques',   value: critiques, icon: ShieldAlert, cls: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-100' },
            { label: 'Risques élevés',      value: eleves,    icon: ShieldAlert, cls: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
            { label: 'Total risques',        value: risquesN,  icon: ShieldAlert, cls: 'text-slate-500',  bg: 'bg-slate-50',  border: 'border-slate-200' },
            { label: 'Opportunités',         value: oppsN,     icon: TrendingUp,  cls: 'text-emerald-500',bg: 'bg-emerald-50',border: 'border-emerald-100' },
          ].map(({ label, value, icon: Icon, cls, bg, border }) => (
            <div key={label} className={`rounded-xl border ${border} ${bg} p-4 flex items-center gap-3`}>
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={18} className={cls} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filtres + vue toggle */}
      {risks.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
          {/* Type */}
          <div className="flex gap-1.5">
            {([['all','Tous'],['risque','Risques'],['opportunite','Opportunités']] as const).map(([v,l]) => (
              <button key={v} onClick={() => setFilterType(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterType === v ? 'bg-[#1B3A6B] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>{l}</button>
            ))}
          </div>

          {/* Statut */}
          <div className="flex gap-1.5">
            {(['all','identifie','en_traitement','clos'] as const).map(v => (
              <button key={v} onClick={() => setFilterStatus(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === v ? 'bg-[#1B3A6B] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>
                {v === 'all' ? 'Tous statuts' : RISK_STATUS_META[v].label}
              </button>
            ))}
          </div>

          {/* Catégorie */}
          <select value={filterCat} onChange={e => setFilterCat(e.target.value as any)}
            className="ml-auto px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600
                       focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]">
            <option value="all">Toutes catégories</option>
            {RISK_CATEGORIES.map(c => (
              <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
            ))}
          </select>

          {/* Vue toggle */}
          <div className="flex gap-1 border border-slate-200 rounded-lg p-0.5">
            <button onClick={() => setView('list')}
              className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-[#1B3A6B] text-white' : 'text-slate-400 hover:text-slate-600'}`}>
              <List size={14} />
            </button>
            <button onClick={() => setView('matrix')}
              className={`p-1.5 rounded-md transition-colors ${view === 'matrix' ? 'bg-[#1B3A6B] text-white' : 'text-slate-400 hover:text-slate-600'}`}>
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Vue Matrice */}
      {view === 'matrix' && risks.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
          <h2 className="font-semibold text-slate-800 text-sm mb-4">Matrice de criticité 5×5</h2>
          <RiskMatrix risks={filtered} />
        </div>
      )}

      {/* Vue Liste */}
      {view === 'list' && (
        <div className="bg-white rounded-xl border border-slate-200">
          {loading ? (
            <div className="px-5 py-12 text-center text-sm text-slate-400">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <ShieldAlert size={36} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Aucun risque trouvé</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {/* En-tête */}
              <div className="grid grid-cols-12 px-5 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide bg-slate-50 rounded-t-xl">
                <div className="col-span-5">Titre</div>
                <div className="col-span-2">Catégorie</div>
                <div className="col-span-1 text-center">Score</div>
                <div className="col-span-2">Traitement</div>
                <div className="col-span-1">Statut</div>
                <div className="col-span-1" />
              </div>

              {filtered.map(r => {
                const catMeta   = RISK_CATEGORIES.find(c => c.key === r.category)
                const scoreMeta = getScoreLevel(r.score)
                const stMeta    = RISK_STATUS_META[r.status]
                const trtMeta   = r.treatment ? RISK_TREATMENT_META[r.treatment] : null

                return (
                  <div key={r.id}
                    className="grid grid-cols-12 px-5 py-3.5 hover:bg-slate-50 transition-colors items-center group">

                    {/* Titre + type */}
                    <div className="col-span-5 flex items-start gap-2.5 min-w-0">
                      <span className={`shrink-0 mt-0.5 w-2 h-2 rounded-full ${r.type === 'risque' ? 'bg-slate-500' : 'bg-emerald-500'}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 leading-snug">{r.title}</p>
                        {r.description && (
                          <p className="text-xs text-slate-400 truncate mt-0.5 pr-4">{r.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Catégorie */}
                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${catMeta?.color}`}>
                        <span>{catMeta?.icon}</span> {catMeta?.label}
                      </span>
                    </div>

                    {/* Score */}
                    <div className="col-span-1 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border ${scoreMeta.cls}`}>
                        {r.score}
                      </span>
                    </div>

                    {/* Traitement */}
                    <div className="col-span-2">
                      {trtMeta ? (
                        <span className="text-xs text-slate-600 font-medium">{trtMeta.label}</span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </div>

                    {/* Statut */}
                    <div className="col-span-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stMeta.cls}`}>
                        {stMeta.label}
                      </span>
                    </div>

                    {/* Modifier */}
                    <div className="col-span-1 text-right">
                      <button
                        onClick={() => { setEditRisk(r); setShowEditor(true) }}
                        className="text-xs text-[#1B3A6B] opacity-0 group-hover:opacity-100
                                   hover:underline font-medium transition-opacity"
                      >
                        Modifier
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal éditeur */}
      {showEditor && (
        <RiskEditor
          orgId={orgId}
          risk={editRisk}
          onClose={() => { setShowEditor(false); setEditRisk(null); load() }}
        />
      )}
    </div>
  )
}
