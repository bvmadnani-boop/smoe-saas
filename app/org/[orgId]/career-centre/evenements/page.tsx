'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Plus, Calendar, Users, X, ChevronDown } from 'lucide-react'
import { EVENEMENT_TYPE_META, type EvenementType } from '@/lib/career-templates'

interface Evenement {
  id: string; titre: string; type: EvenementType
  description: string | null; date_evenement: string | null
  lieu: string | null; nb_places: number | null; nb_inscrits: number
  statut: 'planifie' | 'realise' | 'annule'; created_at: string
}

const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'
const STATUT_META = {
  planifie: { label: 'Planifié',  cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  realise:  { label: 'Réalisé',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  annule:   { label: 'Annulé',   cls: 'bg-slate-100 text-slate-400 border-slate-200' },
}

export default function EvenementsPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const supabase = createClient()
  const [items, setItems] = useState<Evenement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [form, setForm] = useState({ titre: '', type: 'forum' as EvenementType, description: '', date_evenement: '', lieu: '', nb_places: '' })

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('career_evenements').select('*').eq('organization_id', orgId).order('date_evenement', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [orgId])

  async function save() {
    if (!form.titre.trim()) return
    setSaving(true)
    await supabase.from('career_evenements').insert({ organization_id: orgId, titre: form.titre, type: form.type, description: form.description || null, date_evenement: form.date_evenement || null, lieu: form.lieu || null, nb_places: form.nb_places ? parseInt(form.nb_places) : null, statut: 'planifie' })
    setForm({ titre: '', type: 'forum', description: '', date_evenement: '', lieu: '', nb_places: '' })
    setShowForm(false); setSaving(false); load()
  }

  async function updateStatut(id: string, statut: Evenement['statut']) {
    await supabase.from('career_evenements').update({ statut }).eq('id', id)
    setItems(prev => prev.map(e => e.id === id ? { ...e, statut } : e))
  }

  const counts = { total: items.length, planifie: items.filter(e => e.statut === 'planifie').length, realise: items.filter(e => e.statut === 'realise').length }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href={`/org/${orgId}/career-centre`} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#1B3A6B] mb-3 transition-colors"><ArrowLeft size={13} /> Career Centre</Link>
        <div className="flex items-start justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Événements Career</h1><p className="text-slate-500 text-sm mt-0.5">Forum, speed dating, immersions, networking — chaque participation booste le score</p></div>
          <button onClick={() => setShowForm(v => !v)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B3A6B] text-white text-sm rounded-lg hover:bg-[#2E5BA8] transition-colors">
            {showForm ? <X size={15} /> : <Plus size={15} />}{showForm ? 'Annuler' : 'Nouvel événement'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total', value: counts.total, cls: 'border-slate-200', iconCls: 'bg-slate-100 text-slate-500' },
          { label: 'À venir', value: counts.planifie, cls: 'border-blue-100', iconCls: 'bg-blue-50 text-blue-500' },
          { label: 'Réalisés', value: counts.realise, cls: 'border-emerald-100', iconCls: 'bg-emerald-50 text-emerald-500' },
        ].map(k => (
          <div key={k.label} className={`bg-white rounded-xl border ${k.cls} p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl ${k.iconCls} flex items-center justify-center shrink-0`}><Calendar size={18} /></div>
            <div><p className="text-xl font-bold text-slate-900">{k.value}</p><p className="text-xs text-slate-500">{k.label}</p></div>
          </div>
        ))}
      </div>
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-2"><label className={labelCls}>Titre *</label><input className={inputCls} value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} /></div>
            <div><label className={labelCls}>Type</label>
              <select className={inputCls} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as EvenementType }))}>
                {(Object.entries(EVENEMENT_TYPE_META) as [EvenementType, typeof EVENEMENT_TYPE_META[EvenementType]][]).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div><label className={labelCls}>Date</label><input type="date" className={inputCls} value={form.date_evenement} onChange={e => setForm(f => ({ ...f, date_evenement: e.target.value }))} /></div>
            <div><label className={labelCls}>Lieu</label><input className={inputCls} value={form.lieu} onChange={e => setForm(f => ({ ...f, lieu: e.target.value }))} /></div>
            <div><label className={labelCls}>Nombre de places</label><input type="number" className={inputCls} value={form.nb_places} onChange={e => setForm(f => ({ ...f, nb_places: e.target.value }))} /></div>
          </div>
          <div className="mb-5"><label className={labelCls}>Description</label><textarea className={inputCls} rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !form.titre.trim()} className="px-4 py-2 bg-[#1B3A6B] text-white text-sm rounded-lg hover:bg-[#2E5BA8] disabled:opacity-50 transition-colors">{saving ? 'Création...' : 'Créer'}</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 transition-colors">Annuler</button>
          </div>
        </div>
      )}
      {loading ? <div className="text-center py-12 text-slate-400 text-sm">Chargement...</div> : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-14 text-center"><Calendar size={36} className="text-slate-200 mx-auto mb-3" /><p className="text-sm text-slate-400">Aucun événement planifié</p></div>
      ) : (
        <div className="space-y-2">
          {items.map(ev => {
            const typeMeta = EVENEMENT_TYPE_META[ev.type]
            const statMeta = STATUT_META[ev.statut]
            const isExpanded = expandedId === ev.id
            return (
              <div key={ev.id} className="bg-white rounded-xl border border-slate-200">
                <div className="flex items-center px-5 py-4 gap-3 cursor-pointer hover:bg-slate-50 rounded-xl" onClick={() => setExpandedId(isExpanded ? null : ev.id)}>
                  <span className="text-xl shrink-0">{typeMeta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{ev.titre}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${typeMeta.cls}`}>{typeMeta.label}</span>
                      {ev.lieu && <span className="text-xs text-slate-400">📍 {ev.lieu}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {ev.nb_inscrits > 0 && <span className="flex items-center gap-1 text-xs text-slate-400"><Users size={11} />{ev.nb_inscrits}</span>}
                    {ev.date_evenement && <span className="text-xs text-slate-400">{new Date(ev.date_evenement).toLocaleDateString('fr-FR')}</span>}
                    <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${statMeta.cls}`}>{statMeta.label}</span>
                    <ChevronDown size={14} className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-slate-100 pt-3">
                    {ev.description && <p className="text-xs text-slate-600 mb-3">{ev.description}</p>}
                    <div className="flex items-center gap-2 flex-wrap">
                      {(['planifie', 'realise', 'annule'] as const).map(s => (
                        <button key={s} onClick={() => updateStatut(ev.id, s)}
                          className={`text-xs px-2 py-1 rounded-lg border font-medium transition-all ${ev.statut === s ? STATUT_META[s].cls + ' ring-2 ring-offset-1 ring-[#1B3A6B]' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}>
                          {STATUT_META[s].label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
