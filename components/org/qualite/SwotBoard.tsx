'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, Check } from 'lucide-react'

type SwotItem = {
  id: string
  quadrant: string
  content: string
  is_active: boolean
}

const QUADRANTS = [
  {
    key: 'strength',
    label: 'Forces',
    labelEn: 'Strengths',
    color: 'bg-emerald-50 border-emerald-200',
    headerCls: 'bg-emerald-500 text-white',
    dotCls: 'bg-emerald-500',
    badgeCls: 'bg-emerald-50 text-emerald-700',
    icon: '💪',
  },
  {
    key: 'weakness',
    label: 'Faiblesses',
    labelEn: 'Weaknesses',
    color: 'bg-red-50 border-red-200',
    headerCls: 'bg-red-500 text-white',
    dotCls: 'bg-red-500',
    badgeCls: 'bg-red-50 text-red-700',
    icon: '⚠️',
  },
  {
    key: 'opportunity',
    label: 'Opportunités',
    labelEn: 'Opportunities',
    color: 'bg-blue-50 border-blue-200',
    headerCls: 'bg-blue-500 text-white',
    dotCls: 'bg-blue-500',
    badgeCls: 'bg-blue-50 text-blue-700',
    icon: '🚀',
  },
  {
    key: 'threat',
    label: 'Menaces',
    labelEn: 'Threats',
    color: 'bg-amber-50 border-amber-200',
    headerCls: 'bg-amber-500 text-white',
    dotCls: 'bg-amber-500',
    badgeCls: 'bg-amber-50 text-amber-700',
    icon: '🎯',
  },
]

export default function SwotBoard({
  orgId,
  items,
}: {
  orgId: string
  items: SwotItem[]
}) {
  const router   = useRouter()
  const supabase = createClient()
  const [adding,  setAdding]  = useState<string | null>(null)
  const [newText, setNewText] = useState('')
  const [loading, setLoading] = useState(false)

  async function addItem(quadrant: string) {
    if (!newText.trim()) return
    setLoading(true)
    await supabase.from('swot_items').insert({
      organization_id: orgId,
      quadrant,
      content: newText.trim(),
    })
    setNewText('')
    setAdding(null)
    setLoading(false)
    router.refresh()
  }

  async function removeItem(id: string) {
    await supabase.from('swot_items').delete().eq('id', id)
    router.refresh()
  }

  async function toggleItem(id: string, current: boolean) {
    await supabase.from('swot_items').update({ is_active: !current }).eq('id', id)
    router.refresh()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {QUADRANTS.map(q => {
        const qItems = items.filter(i => i.quadrant === q.key)
        return (
          <div key={q.key} className={`rounded-xl border ${q.color} overflow-hidden`}>
            {/* Header */}
            <div className={`px-4 py-3 ${q.headerCls} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className="text-base">{q.icon}</span>
                <div>
                  <p className="font-semibold text-sm">{q.label}</p>
                  <p className="text-xs opacity-75">{q.labelEn} · {qItems.filter(i => i.is_active).length} élément{qItems.filter(i => i.is_active).length > 1 ? 's' : ''}</p>
                </div>
              </div>
              <button
                onClick={() => { setAdding(q.key); setNewText('') }}
                className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Items */}
            <div className="p-3 space-y-2 min-h-[120px]">
              {qItems.map(item => (
                <div
                  key={item.id}
                  className={`group flex items-start gap-2 px-3 py-2 rounded-lg bg-white border border-white/80 shadow-sm transition-opacity ${!item.is_active ? 'opacity-40' : ''}`}
                >
                  <div className={`w-2 h-2 rounded-full ${q.dotCls} shrink-0 mt-1.5`} />
                  <p className={`text-xs text-slate-700 flex-1 leading-relaxed ${!item.is_active ? 'line-through' : ''}`}>
                    {item.content}
                  </p>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => toggleItem(item.id, item.is_active)}
                      className="w-5 h-5 rounded text-slate-400 hover:text-emerald-500 transition-colors flex items-center justify-center"
                      title={item.is_active ? 'Désactiver' : 'Activer'}
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-5 h-5 rounded text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Inline add form */}
              {adding === q.key && (
                <div className="flex gap-2 mt-1">
                  <input
                    autoFocus
                    value={newText}
                    onChange={e => setNewText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addItem(q.key); if (e.key === 'Escape') setAdding(null) }}
                    placeholder="Nouveau point..."
                    className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent bg-white"
                  />
                  <button
                    onClick={() => addItem(q.key)}
                    disabled={loading || !newText.trim()}
                    className="px-2.5 py-1.5 bg-[#1B3A6B] text-white rounded-lg text-xs disabled:opacity-50 hover:bg-[#2E5BA8] transition-colors"
                  >
                    <Check size={12} />
                  </button>
                  <button
                    onClick={() => setAdding(null)}
                    className="px-2 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs hover:bg-slate-200 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {qItems.length === 0 && adding !== q.key && (
                <p className="text-xs text-slate-300 text-center py-4">
                  Aucun élément — cliquez + pour ajouter
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
