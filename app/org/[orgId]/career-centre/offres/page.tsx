'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Plus, Briefcase, X, ChevronDown, AlertTriangle } from 'lucide-react'
import { OFFRE_TYPE_META, OFFRE_STATUT_META, type OffreType, type OffreStatut } from '@/lib/career-templates'

interface Offre {
  id: string; titre: string; type: OffreType; statut: OffreStatut
  entreprise_id: string | null; filiere_id: string | null
  description: string | null; localisation: string | null
  remuneration: string | null; date_debut: string | null
  date_limite: string | null; nb_candidatures: number; created_at: string
}
interface Entreprise { id: string; nom: string }
interface Filiere { id: string; name: string }

const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

export default function OffresPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const supabase = createClient()
  const [offres, setOffres] = useState<Offre[]>([])
  const [entreprises, setEntreprises] = useState<Entreprise[]>([])
  const [filieres, setFilieres] = useState<Filiere[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterType, setFilterType] = useState('')
  const [form, setForm] = useState({ titre: '', type: 'stage' as OffreType, entreprise_id: '', filiere_id: '', description: '', localisation: '', remuneration: '', date_debut: '', date_limite: '' })

  async function load() {
    setLoading(true)
    const [{ data: o }, { data: e }, { data: f }] = await Promise.all([
      supabase.from('career_offres').select('*').eq('organization_id', orgId).order('created_at', { ascending: false }),
      supabase.from('career_entreprises').select('id, nom').eq('organization_id', orgId),
      supabase.from('filieres').select('id, name').eq('organization_id', orgId),
    ])
    setOffres(o ?? []); setEntreprises(e ?? []); setFilieres(f ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [orgId])

  async function save() {
    if (!form.titre.trim()) return
    setSaving(true)
    await supabase.from('career_offres').insert({ organization_id: orgId, titre: form.titre, type: form.type, statut: 'active', entreprise_id: form.entreprise_id || null, filiere_id: form.filiere_id || null, description: form.description || null, localisation: form.localisation || null, remuneration: form.remuneration || null, date_debut: form.date_debut || null, date_limite: form.date_limite || null })
    setForm({ titre: '', type: 'stage', entreprise_id: '', filiere_id: '', description: '', localisation: '', remuneration: '', date_debut: '', date_limite: '' })
    setShowForm(false); setSaving(false); load()
  }

  async function updateStatut(id: string, statut: OffreStatut) {
    await supabase.from('career_offres').update({ statut }).eq('id', id)
    setOffres(prev => prev.map(o => o.id === id ? { ...o, statut } : o))
  }

  const filtered = filterType ? offres.filter(o => o.type === filterType) : offres
  const counts = { total: offres.length, active: offres.filter(o => o.statut === 'active').length, pourvue: offres.filter(o => o.statut === 'pourvue').length }
  const expiring = offres.filter(o => o.statut === 'active' && o.date_limite && new Date(o.date_limite) < new Date(Date.now() + 7 * 86400000)).length

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href={`/org/${orgId}/career-centre`} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#1B3A6B] mb-3 transition-colors"><ArrowLeft size={13} /> Career Centre</Link>
        <div className="flex items-start justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Offres d'emploi & stage</h1><p className="text-slate-500 text-sm mt-0.5">Emploi · Stage · Alternance · VIE · Freelance</p></div>
          <button onClick={() => setShowForm(v => !v)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B3A6B] text-white text-sm rounded-lg hover:bg-[#2E5BA8] transition-colors">
            {showForm ? <X size={15} /> : <Plus size={15} />}{showForm ? 'Annuler' : 'Nouvelle offre'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Offres actives', value: counts.active, cls: 'border-emerald-100', iconCls: 'bg-emerald-50 text-emerald-500' },
          { label: 'Pourvues', value: counts.pourvue, cls: 'border-slate-200', iconCls: 'bg-slate-100 text-slate-400' },
          { label: 'Expirent bientôt', value: expiring, cls: expiring > 0 ? 'border-amber-200' : 'border-slate-200', iconCls: expiring > 0 ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-400' },
        ].map(k => (
          <div key={k.label} className={`bg-white rounded-xl border ${k.cls} p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl ${k.iconCls} flex items-center justify-center shrink-0`}><Briefcase size={18} /></div>
            <div><p className="text-xl font-bold text-slate-900">{k.value}</p><p className="text-xs text-slate-500">{k.label}</p></div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
          <h2 className="font-semibold text-slate-800 text-sm mb-4">Nouvelle offre</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-2"><label className={labelCls}>Titre *</label><input className={inputCls} value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} /></div>
            <div><label className={labelCls}>Type</label>
              <select className={inputCls} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as OffreType }))}>
                {(Object.entries(OFFRE_TYPE_META) as [OffreType, typeof OFFRE_TYPE_META[OffreType]][]).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div><label className={labelCls}>Entreprise</label>
              <select className={inputCls} value={form.entreprise_id} onChange={e => setForm(f => ({ ...f, entreprise_id: e.target.value }))}>
                <option value="">— Sélectionner —</option>
                {entreprises.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Filière ciblée</label>
              <select className={inputCls} value={form.filiere_id} onChange={e => setForm(f => ({ ...f, filiere_id: e.target.value }))}>
                <option value="">— Toutes —</option>
                {filieres.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Localisation</label><input className={inputCls} value={form.localisation} onChange={e => setForm(f => ({ ...f, localisation: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div><label className={labelCls}>Rémunération</label><input className={inputCls} placeholder="ex: 1800€/mois" value={form.remuneration} onChange={e => setForm(f => ({ ...f, remuneration: e.target.value }))} /></div>
            <div><label className={labelCls}>Date de début</label><input type="date" className={inputCls} value={form.date_debut} onChange={e => setForm(f => ({ ...f, date_debut: e.target.value }))} /></div>
            <div><label className={labelCls}>Date limite candidature</label><input type="date" className={inputCls} value={form.date_limite} onChange={e => setForm(f => ({ ...f, date_limite: e.target.value }))} /></div>
          </div>
          <div className="mb-5"><label className={labelCls}>Description</label><textarea className={inputCls} rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !form.titre.trim()} className="px-4 py-2 bg-[#1B3A6B] text-white text-sm rounded-lg hover:bg-[#2E5BA8] disabled:opacity-50 transition-colors">{saving ? 'Ajout...' : 'Publier l\'offre'}</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 transition-colors">Annuler</button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {['', ...Object.keys(OFFRE_TYPE_META)].map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${filterType === t ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
            {t === '' ? 'Tous' : `${OFFRE_TYPE_META[t as OffreType].icon} ${OFFRE_TYPE_META[t as OffreType].label}`}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center py-12 text-slate-400 text-sm">Chargement...</div> : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-14 text-center">
          <Briefcase size={36} className="text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Aucune offre publiée</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(o => {
            const typeMeta = OFFRE_TYPE_META[o.type]
            const statMeta = OFFRE_STATUT_META[o.statut]
            const entreprise = entreprises.find(e => e.id === o.entreprise_id)
            const isExpanded = expandedId === o.id
            const isExpiring = o.statut === 'active' && o.date_limite && new Date(o.date_limite) < new Date(Date.now() + 7 * 86400000)
            return (
              <div key={o.id} className="bg-white rounded-xl border border-slate-200">
                <div className="flex items-center px-5 py-4 gap-3 cursor-pointer hover:bg-slate-50 rounded-xl" onClick={() => setExpandedId(isExpanded ? null : o.id)}>
                  <span className="text-xl shrink-0">{typeMeta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{o.titre}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${typeMeta.cls}`}>{typeMeta.label}</span>
                      {entreprise && <span className="text-xs text-slate-400">{entreprise.nom}</span>}
                      {o.localisation && <span className="text-xs text-slate-400">📍 {o.localisation}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isExpiring && <AlertTriangle size={13} className="text-amber-400" />}
                    {o.date_limite && <span className={`text-xs ${isExpiring ? 'text-amber-500 font-medium' : 'text-slate-400'}`}>📅 {new Date(o.date_limite).toLocaleDateString('fr-FR')}</span>}
                    <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${statMeta.cls}`}>{statMeta.label}</span>
                    <ChevronDown size={14} className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-slate-100 pt-3">
                    {o.description && <p className="text-xs text-slate-600 mb-3">{o.description}</p>}
                    <div className="flex items-center gap-3 mb-3 text-xs text-slate-500">
                      {o.remuneration && <span>💰 {o.remuneration}</span>}
                      {o.date_debut && <span>🗓️ Début : {new Date(o.date_debut).toLocaleDateString('fr-FR')}</span>}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400 mr-1">Statut :</span>
                      {(['active', 'pourvue', 'expiree'] as OffreStatut[]).map(s => (
                        <button key={s} onClick={() => updateStatut(o.id, s)}
                          className={`text-xs px-2 py-1 rounded-lg border font-medium transition-all ${o.statut === s ? OFFRE_STATUT_META[s].cls + ' ring-2 ring-offset-1 ring-[#1B3A6B]' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}>
                          {OFFRE_STATUT_META[s].label}
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
