'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Plus, Building2, X, ChevronDown, CheckCircle2 } from 'lucide-react'
import {
  ENTREPRISE_TAILLE_META, ENTREPRISE_STATUT_META,
  type EntrepriseTaille, type EntrepriseStatut,
} from '@/lib/career-templates'

interface Entreprise {
  id: string; nom: string; secteur: string | null
  taille: EntrepriseTaille; statut: EntrepriseStatut
  contact_rh: string | null; email_rh: string | null; tel_rh: string | null
  convention: boolean; nb_placements: number; notes: string | null
  created_at: string
}

const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

export default function EntreprisesPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const supabase = createClient()
  const [items, setItems] = useState<Entreprise[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [form, setForm] = useState({ nom: '', secteur: '', taille: 'pme' as EntrepriseTaille, statut: 'prospect' as EntrepriseStatut, contact_rh: '', email_rh: '', tel_rh: '', convention: false, notes: '' })

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('career_entreprises').select('*').eq('organization_id', orgId).order('nb_placements', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [orgId])

  async function save() {
    if (!form.nom.trim()) return
    setSaving(true)
    await supabase.from('career_entreprises').insert({ organization_id: orgId, ...form, secteur: form.secteur || null, contact_rh: form.contact_rh || null, email_rh: form.email_rh || null, tel_rh: form.tel_rh || null, notes: form.notes || null })
    setForm({ nom: '', secteur: '', taille: 'pme', statut: 'prospect', contact_rh: '', email_rh: '', tel_rh: '', convention: false, notes: '' })
    setShowForm(false); setSaving(false); load()
  }

  async function updateStatut(id: string, statut: EntrepriseStatut) {
    await supabase.from('career_entreprises').update({ statut }).eq('id', id)
    setItems(prev => prev.map(e => e.id === id ? { ...e, statut } : e))
  }

  const counts = { total: items.length, partenaires: items.filter(e => e.statut === 'partenaire').length, recruteurs: items.filter(e => e.statut === 'recruteur_actif').length, conventions: items.filter(e => e.convention).length }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href={`/org/${orgId}/career-centre`} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#1B3A6B] mb-3 transition-colors"><ArrowLeft size={13} /> Career Centre</Link>
        <div className="flex items-start justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Entreprises partenaires</h1><p className="text-slate-500 text-sm mt-0.5">Réseau recruteurs · Conventions · Historique placements</p></div>
          <button onClick={() => setShowForm(v => !v)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B3A6B] text-white text-sm rounded-lg hover:bg-[#2E5BA8] transition-colors">
            {showForm ? <X size={15} /> : <Plus size={15} />}{showForm ? 'Annuler' : 'Nouvelle entreprise'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total', value: counts.total, cls: 'border-slate-200', iconCls: 'bg-slate-100 text-slate-500' },
          { label: 'Partenaires', value: counts.partenaires, cls: 'border-blue-100', iconCls: 'bg-blue-50 text-blue-500' },
          { label: 'Recruteurs actifs', value: counts.recruteurs, cls: 'border-emerald-100', iconCls: 'bg-emerald-50 text-emerald-500' },
          { label: 'Avec convention', value: counts.conventions, cls: 'border-violet-100', iconCls: 'bg-violet-50 text-violet-500' },
        ].map(k => (
          <div key={k.label} className={`bg-white rounded-xl border ${k.cls} p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl ${k.iconCls} flex items-center justify-center shrink-0`}><Building2 size={18} /></div>
            <div><p className="text-xl font-bold text-slate-900">{k.value}</p><p className="text-xs text-slate-500">{k.label}</p></div>
          </div>
        ))}
      </div>
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
          <h2 className="font-semibold text-slate-800 text-sm mb-4">Nouvelle entreprise</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-2"><label className={labelCls}>Nom *</label><input className={inputCls} value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} /></div>
            <div><label className={labelCls}>Secteur</label><input className={inputCls} placeholder="IT, BTP, Finance..." value={form.secteur} onChange={e => setForm(f => ({ ...f, secteur: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div><label className={labelCls}>Taille</label>
              <select className={inputCls} value={form.taille} onChange={e => setForm(f => ({ ...f, taille: e.target.value as EntrepriseTaille }))}>
                {(Object.entries(ENTREPRISE_TAILLE_META) as [EntrepriseTaille, typeof ENTREPRISE_TAILLE_META[EntrepriseTaille]][]).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Statut</label>
              <select className={inputCls} value={form.statut} onChange={e => setForm(f => ({ ...f, statut: e.target.value as EntrepriseStatut }))}>
                {(Object.entries(ENTREPRISE_STATUT_META) as [EntrepriseStatut, typeof ENTREPRISE_STATUT_META[EntrepriseStatut]][]).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Contact RH</label><input className={inputCls} value={form.contact_rh} onChange={e => setForm(f => ({ ...f, contact_rh: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div><label className={labelCls}>Email RH</label><input type="email" className={inputCls} value={form.email_rh} onChange={e => setForm(f => ({ ...f, email_rh: e.target.value }))} /></div>
            <div><label className={labelCls}>Tél RH</label><input className={inputCls} value={form.tel_rh} onChange={e => setForm(f => ({ ...f, tel_rh: e.target.value }))} /></div>
            <div className="flex items-end pb-2"><label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600"><input type="checkbox" className="w-4 h-4 accent-[#1B3A6B]" checked={form.convention} onChange={e => setForm(f => ({ ...f, convention: e.target.checked }))} /> Convention signée</label></div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !form.nom.trim()} className="px-4 py-2 bg-[#1B3A6B] text-white text-sm rounded-lg hover:bg-[#2E5BA8] disabled:opacity-50 transition-colors">{saving ? 'Ajout...' : 'Ajouter'}</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 transition-colors">Annuler</button>
          </div>
        </div>
      )}
      {loading ? <div className="text-center py-12 text-slate-400 text-sm">Chargement...</div> : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-14 text-center">
          <Building2 size={36} className="text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Aucune entreprise enregistrée</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(e => {
            const statMeta = ENTREPRISE_STATUT_META[e.statut]
            const isExpanded = expandedId === e.id
            return (
              <div key={e.id} className="bg-white rounded-xl border border-slate-200">
                <div className="flex items-center px-5 py-4 gap-3 cursor-pointer hover:bg-slate-50 rounded-xl" onClick={() => setExpandedId(isExpanded ? null : e.id)}>
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0"><Building2 size={16} className="text-slate-500" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{e.nom}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {e.secteur && <span className="text-xs text-slate-400">{e.secteur}</span>}
                      <span className="text-xs text-slate-300">·</span>
                      <span className="text-xs text-slate-400">{ENTREPRISE_TAILLE_META[e.taille].label}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {e.convention && <span className="text-xs bg-violet-50 text-violet-600 border border-violet-200 px-1.5 py-0.5 rounded font-medium">📋 Convention</span>}
                    {e.nb_placements > 0 && <span className="text-xs text-slate-500 font-medium">{e.nb_placements} placement{e.nb_placements > 1 ? 's' : ''}</span>}
                    <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${statMeta.cls}`}>{statMeta.label}</span>
                    <ChevronDown size={14} className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-slate-100 pt-3">
                    <div className="grid grid-cols-3 gap-3 mb-3 text-xs text-slate-600">
                      {e.contact_rh && <div><span className="text-slate-400">Contact RH</span><p className="font-medium">{e.contact_rh}</p></div>}
                      {e.email_rh && <div><span className="text-slate-400">Email</span><p className="font-medium">{e.email_rh}</p></div>}
                      {e.tel_rh && <div><span className="text-slate-400">Tél</span><p className="font-medium">{e.tel_rh}</p></div>}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400 mr-1">Statut :</span>
                      {(['prospect', 'partenaire', 'recruteur_actif'] as EntrepriseStatut[]).map(s => (
                        <button key={s} onClick={() => updateStatut(e.id, s)}
                          className={`text-xs px-2 py-1 rounded-lg border font-medium transition-all ${e.statut === s ? ENTREPRISE_STATUT_META[s].cls + ' ring-2 ring-offset-1 ring-[#1B3A6B]' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}>
                          {ENTREPRISE_STATUT_META[s].label}
                        </button>
                      ))}
                      <Link href={`/org/${orgId}/career-centre/offres?entreprise=${e.id}`}
                        className="ml-auto text-xs text-[#1B3A6B] hover:underline font-medium">Voir les offres →</Link>
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
