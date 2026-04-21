'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, Check } from 'lucide-react'

type PestelItem = {
  id: string
  dimension: string
  content: string
  impact: string
  is_active: boolean
}

const DIMENSIONS = [
  { key: 'politique',       label: 'Politique',       icon: '🏛️',  color: 'bg-blue-50 border-blue-200',     headerCls: 'bg-blue-600 text-white',    dotCls: 'bg-blue-500' },
  { key: 'economique',      label: 'Économique',      icon: '💰',  color: 'bg-emerald-50 border-emerald-200', headerCls: 'bg-emerald-600 text-white', dotCls: 'bg-emerald-500' },
  { key: 'social',          label: 'Social',          icon: '👥',  color: 'bg-violet-50 border-violet-200',  headerCls: 'bg-violet-600 text-white',  dotCls: 'bg-violet-500' },
  { key: 'technologique',   label: 'Technologique',   icon: '💻',  color: 'bg-cyan-50 border-cyan-200',      headerCls: 'bg-cyan-600 text-white',    dotCls: 'bg-cyan-500' },
  { key: 'environnemental', label: 'Environnemental', icon: '🌿',  color: 'bg-lime-50 border-lime-200',      headerCls: 'bg-lime-600 text-white',    dotCls: 'bg-lime-500' },
  { key: 'legal',           label: 'Légal',           icon: '⚖️',  color: 'bg-amber-50 border-amber-200',   headerCls: 'bg-amber-600 text-white',   dotCls: 'bg-amber-500' },
]

const IMPACT_META = {
  positif: { label: 'Positif',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  negatif: { label: 'Négatif',  cls: 'bg-red-50 text-red-700 border-red-200' },
  neutre:  { label: 'Neutre',   cls: 'bg-slate-100 text-slate-500 border-slate-200' },
}

export default function PestelTable({
  orgId,
  items,
}: {
  orgId: string
  items: PestelItem[]
}) {
  const router   = useRouter()
  const supabase = createClient()
  const [adding,  setAdding]  = useState<string | null>(null)
  const [newText, setNewText] = useState('')
  const [newImpact, setNewImpact] = useState<'positif' | 'negatif' | 'neutre'>('neutre')
  const [loading, setLoading] = useState(false)

  async function addItem(dimension: string) {
    if (!newText.trim()) return
    setLoading(true)
    await supabase.from('pestel_items').insert({
      organization_id: orgId,
      dimension,
      content: newText.trim(),
      impact: newImpact,
    })
    setNewText('')
    setAdding(null)
    setLoading(false)
    router.refresh()
  }

  async function removeItem(id: string) {
    await supabase.from('pestel_items').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {DIMENSIONS.map(dim => {
        const dItems = items.filter(i => i.dimension === dim.key)
        return (
          <div key={dim.key} className={`rounded-xl border ${dim.color} overflow-hidden`}>
            <div className={`px-4 py-2.5 ${dim.headerCls} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span>{dim.icon}</span>
                <span className="font-semibold text-sm">{dim.label}</span>
                <span className="text-xs opacity-75">· {dItems.filter(i => i.is_active).length} facteur{dItems.filter(i => i.is_active).length > 1 ? 's' : ''}</span>
              </div>
              <button
                onClick={() => { setAdding(dim.key); setNewText(''); setNewImpact('neutre') }}
                className="w-6 h-6 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <Plus size={13} />
              </button>
            </div>

            <div className="divide-y divide-white/60">
              {dItems.map(item => {
                const impMeta = IMPACT_META[item.impact as keyof typeof IMPACT_META] ?? IMPACT_META.neutre
                return (
                  <div key={item.id}
                    className={`group flex items-start gap-3 px-4 py-2.5 bg-white/60 hover:bg-white transition-colors ${!item.is_active ? 'opacity-40' : ''}`}>
                    <div className={`w-2 h-2 rounded-full ${dim.dotCls} shrink-0 mt-1.5`} />
                    <p className={`text-xs text-slate-700 flex-1 leading-relaxed ${!item.is_active ? 'line-through' : ''}`}>
                      {item.content}
                    </p>
                    <span className={`text-xs px-1.5 py-0.5 rounded border font-medium shrink-0 ${impMeta.cls}`}>
                      {impMeta.label}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-5 h-5 rounded text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )
              })}

              {/* Inline add */}
              {adding === dim.key && (
                <div className="px-4 py-3 bg-white space-y-2">
                  <input
                    autoFocus
                    value={newText}
                    onChange={e => setNewText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addItem(dim.key); if (e.key === 'Escape') setAdding(null) }}
                    placeholder="Nouveau facteur..."
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Impact :</span>
                    {(['positif','negatif','neutre'] as const).map(imp => (
                      <button
                        key={imp}
                        type="button"
                        onClick={() => setNewImpact(imp)}
                        className={`text-xs px-2 py-0.5 rounded border font-medium transition-all ${
                          newImpact === imp ? IMPACT_META[imp].cls : 'bg-white border-slate-200 text-slate-400'
                        }`}
                      >
                        {IMPACT_META[imp].label}
                      </button>
                    ))}
                    <div className="flex-1" />
                    <button onClick={() => addItem(dim.key)} disabled={loading || !newText.trim()}
                      className="px-2.5 py-1 bg-[#1B3A6B] text-white rounded text-xs disabled:opacity-50">
                      <Check size={11} />
                    </button>
                    <button onClick={() => setAdding(null)}
                      className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs">
                      <X size={11} />
                    </button>
                  </div>
                </div>
              )}

              {dItems.length === 0 && adding !== dim.key && (
                <p className="text-xs text-slate-300 text-center py-3 bg-white/30">Aucun facteur</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
