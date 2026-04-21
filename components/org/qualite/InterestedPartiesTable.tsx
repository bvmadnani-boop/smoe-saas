'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, Check } from 'lucide-react'
import { PI_GROUPS, type PiGroupKey } from '@/lib/context-templates'

type Party = {
  id: string
  name: string
  category: string
  group_key: string | null
  needs: string | null
  expectations: string | null
  influence_level: string
  interest_level: string
  is_active: boolean
}

const LEVEL_META = {
  fort:   { label: 'Fort',   cls: 'bg-red-100 text-red-700' },
  moyen:  { label: 'Moyen',  cls: 'bg-amber-100 text-amber-700' },
  faible: { label: 'Faible', cls: 'bg-slate-100 text-slate-500' },
}

export default function InterestedPartiesBoard({
  orgId,
  parties,
}: {
  orgId: string
  parties: Party[]
}) {
  const router   = useRouter()
  const supabase = createClient()
  const [adding,    setAdding]    = useState<string | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', category: 'externe', needs: '', expectations: '',
    influence_level: 'moyen', interest_level: 'moyen',
  })

  function setF(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  async function addParty(groupKey: string) {
    if (!form.name.trim()) return
    setLoading(true)
    await supabase.from('interested_parties').insert({
      organization_id: orgId,
      name:            form.name.trim(),
      category:        form.category,
      group_key:       groupKey,
      needs:           form.needs.trim() || null,
      expectations:    form.expectations.trim() || null,
      influence_level: form.influence_level,
      interest_level:  form.interest_level,
    })
    setForm({ name: '', category: 'externe', needs: '', expectations: '', influence_level: 'moyen', interest_level: 'moyen' })
    setAdding(null)
    setLoading(false)
    router.refresh()
  }

  async function removeParty(id: string) {
    await supabase.from('interested_parties').delete().eq('id', id)
    router.refresh()
  }

  const inputCls = `w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent bg-white`

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {PI_GROUPS.map(group => {
        const gParties = parties.filter(p => (p.group_key ?? 'territoire') === group.key)
        return (
          <div key={group.key} className={`rounded-xl border ${group.borderCls} overflow-hidden`}>
            {/* Header */}
            <div className={`px-4 py-3 ${group.color} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className="text-base">{group.icon}</span>
                <div>
                  <p className={`font-semibold text-sm ${group.textCls}`}>{group.label}</p>
                  <p className={`text-xs opacity-70 ${group.textCls}`}>
                    {gParties.length} partie{gParties.length > 1 ? 's' : ''} intéressée{gParties.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setAdding(group.key); setForm({ name: '', category: 'externe', needs: '', expectations: '', influence_level: 'moyen', interest_level: 'moyen' }) }}
                className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <Plus size={14} className={group.textCls} />
              </button>
            </div>

            {/* Items */}
            <div className={`p-2.5 space-y-2 min-h-[100px] ${group.lightCls}`}>
              {gParties.map(p => {
                const infMeta = LEVEL_META[p.influence_level as keyof typeof LEVEL_META] ?? LEVEL_META.moyen
                const intMeta = LEVEL_META[p.interest_level  as keyof typeof LEVEL_META] ?? LEVEL_META.moyen
                const isExp   = expandedId === p.id
                return (
                  <div key={p.id}
                    className="group bg-white rounded-lg border border-white shadow-sm overflow-hidden">
                    <div
                      className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => setExpandedId(isExp ? null : p.id)}
                    >
                      <div className={`w-2 h-2 rounded-full ${group.dotCls} shrink-0`} />
                      <p className="text-xs font-medium text-slate-800 flex-1 leading-tight">{p.name}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${infMeta.cls}`} title="Influence">
                          {infMeta.label[0]}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${intMeta.cls}`} title="Intérêt">
                          {intMeta.label[0]}
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); removeParty(p.id) }}
                          className="w-5 h-5 rounded text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center ml-1"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    </div>
                    {/* Détails dépliables */}
                    {isExp && (p.needs || p.expectations) && (
                      <div className="px-3 pb-2.5 pt-0 bg-slate-50 border-t border-slate-100 space-y-1">
                        {p.needs && (
                          <p className="text-xs text-slate-600 leading-relaxed">
                            <span className="font-semibold text-slate-500">Besoins : </span>{p.needs}
                          </p>
                        )}
                        {p.expectations && (
                          <p className="text-xs text-slate-500 leading-relaxed">
                            <span className="font-semibold">Attentes : </span>{p.expectations}
                          </p>
                        )}
                        <div className="flex items-center gap-2 pt-1">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${p.category === 'interne' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {p.category === 'interne' ? 'Interne' : 'Externe'}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${infMeta.cls}`}>
                            Influence : {infMeta.label}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${intMeta.cls}`}>
                            Intérêt : {intMeta.label}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Formulaire inline ajout */}
              {adding === group.key && (
                <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-2">
                  <input autoFocus value={form.name} onChange={e => setF('name', e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addParty(group.key); if (e.key === 'Escape') setAdding(null) }}
                    placeholder="Nom de la partie intéressée *" className={inputCls} />
                  <div className="grid grid-cols-2 gap-2">
                    <select value={form.category} onChange={e => setF('category', e.target.value)} className={inputCls}>
                      <option value="externe">Externe</option>
                      <option value="interne">Interne</option>
                    </select>
                    <div className="flex gap-1">
                      <select value={form.influence_level} onChange={e => setF('influence_level', e.target.value)} className={inputCls}>
                        <option value="fort">Infl. Fort</option>
                        <option value="moyen">Infl. Moyen</option>
                        <option value="faible">Infl. Faible</option>
                      </select>
                    </div>
                  </div>
                  <input value={form.needs} onChange={e => setF('needs', e.target.value)}
                    placeholder="Besoins (optionnel)" className={inputCls} />
                  <input value={form.expectations} onChange={e => setF('expectations', e.target.value)}
                    placeholder="Attentes (optionnel)" className={inputCls} />
                  <div className="flex gap-2">
                    <button onClick={() => addParty(group.key)} disabled={loading || !form.name.trim()}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#1B3A6B] text-white rounded-lg text-xs disabled:opacity-50 hover:bg-[#2E5BA8] transition-colors">
                      <Check size={11} /> Ajouter
                    </button>
                    <button onClick={() => setAdding(null)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs hover:bg-slate-200 transition-colors">
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {gParties.length === 0 && adding !== group.key && (
                <p className="text-xs text-slate-400 text-center py-4">
                  Cliquez + pour ajouter
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
