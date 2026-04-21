'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft, Plus, AlertTriangle, MessageSquare,
  Trash2, ExternalLink, X, ChevronDown,
} from 'lucide-react'
import {
  RECLAMATION_PARTIE_META, RECLAMATION_CATEGORIE_META,
  RECLAMATION_GRAVITE_META, RECLAMATION_STATUT_META,
  type ReclamationPartie, type ReclamationCategorie,
  type ReclamationGravite, type ReclamationStatut,
} from '@/lib/amelioration-templates'

interface Reclamation {
  id: string
  numero: string | null
  partie_type: ReclamationPartie
  partie_nom: string | null
  categorie: ReclamationCategorie
  gravite: ReclamationGravite
  statut: ReclamationStatut
  description: string
  action_realisee: string | null
  responsable: string | null
  date_reception: string
  delai_traitement: string | null
  nc_id: string | null
  created_at: string
}

const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

const today = new Date().toISOString().split('T')[0]

export default function ReclamationsPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const supabase = createClient()

  const [items, setItems] = useState<Reclamation[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [form, setForm] = useState({
    partie_type: 'apprenant' as ReclamationPartie,
    partie_nom: '',
    categorie: 'autre' as ReclamationCategorie,
    gravite: 'mineure' as ReclamationGravite,
    statut: 'recue' as ReclamationStatut,
    description: '',
    action_realisee: '',
    responsable: '',
    date_reception: today,
    delai_traitement: '',
  })

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('reclamations')
      .select('*')
      .eq('organization_id', orgId)
      .order('date_reception', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [orgId])

  async function save() {
    if (!form.description.trim()) return
    setSaving(true)
    const year = new Date().getFullYear()
    const numero = `REC-${year}-${String((items.length + 1)).padStart(3, '0')}`
    await supabase.from('reclamations').insert({
      organization_id: orgId,
      numero,
      partie_type: form.partie_type,
      partie_nom: form.partie_nom || null,
      categorie: form.categorie,
      gravite: form.gravite,
      statut: form.statut,
      description: form.description,
      action_realisee: form.action_realisee || null,
      responsable: form.responsable || null,
      date_reception: form.date_reception,
      delai_traitement: form.delai_traitement || null,
    })
    setForm({
      partie_type: 'apprenant', partie_nom: '', categorie: 'autre',
      gravite: 'mineure', statut: 'recue', description: '',
      action_realisee: '', responsable: '', date_reception: today, delai_traitement: '',
    })
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function updateStatut(id: string, statut: ReclamationStatut) {
    await supabase.from('reclamations').update({ statut }).eq('id', id)
    setItems(prev => prev.map(r => r.id === id ? { ...r, statut } : r))
  }

  const counts = {
    total: items.length,
    majeures: items.filter(r => r.gravite === 'majeure' && !['resolue', 'cloturee'].includes(r.statut)).length,
    en_cours: items.filter(r => r.statut === 'en_cours').length,
    cloturees: items.filter(r => r.statut === 'cloturee').length,
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/org/${orgId}/qualite`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#1B3A6B] mb-3 transition-colors">
          <ArrowLeft size={13} /> P6 Amélioration
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Réclamations</h1>
            <p className="text-slate-500 text-sm mt-0.5">ISO 21001 §10.2 + §9.1.2 — Parties intéressées</p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B3A6B] text-white text-sm rounded-lg hover:bg-[#2E5BA8] transition-colors">
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? 'Annuler' : 'Nouvelle réclamation'}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total', value: counts.total, cls: 'border-slate-200', iconCls: 'bg-slate-100 text-slate-500' },
          { label: 'Majeures actives', value: counts.majeures, cls: 'border-red-100', iconCls: 'bg-red-50 text-red-500' },
          { label: 'En cours', value: counts.en_cours, cls: 'border-amber-100', iconCls: 'bg-amber-50 text-amber-500' },
          { label: 'Clôturées', value: counts.cloturees, cls: 'border-emerald-100', iconCls: 'bg-emerald-50 text-emerald-500' },
        ].map(k => (
          <div key={k.label} className={`bg-white rounded-xl border ${k.cls} p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl ${k.iconCls} flex items-center justify-center shrink-0`}>
              <MessageSquare size={18} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{k.value}</p>
              <p className="text-xs text-slate-500">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alert majeure */}
      {counts.majeures > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-5">
          <AlertTriangle size={15} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            {counts.majeures} réclamation{counts.majeures > 1 ? 's' : ''} majeure{counts.majeures > 1 ? 's' : ''} non résolue{counts.majeures > 1 ? 's' : ''} — Traitement prioritaire requis
          </p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
          <h2 className="font-semibold text-slate-800 text-sm mb-4">Nouvelle réclamation</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className={labelCls}>Partie</label>
              <select className={inputCls} value={form.partie_type}
                onChange={e => setForm(f => ({ ...f, partie_type: e.target.value as ReclamationPartie }))}>
                {(Object.entries(RECLAMATION_PARTIE_META) as [ReclamationPartie, { label: string; icon: string }][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Nom / Référence</label>
              <input className={inputCls} placeholder="Nom de la partie" value={form.partie_nom}
                onChange={e => setForm(f => ({ ...f, partie_nom: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Date de réception</label>
              <input type="date" className={inputCls} value={form.date_reception}
                onChange={e => setForm(f => ({ ...f, date_reception: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className={labelCls}>Catégorie</label>
              <select className={inputCls} value={form.categorie}
                onChange={e => setForm(f => ({ ...f, categorie: e.target.value as ReclamationCategorie }))}>
                {(Object.entries(RECLAMATION_CATEGORIE_META) as [ReclamationCategorie, { label: string }][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Gravité</label>
              <select className={inputCls} value={form.gravite}
                onChange={e => setForm(f => ({ ...f, gravite: e.target.value as ReclamationGravite }))}>
                {(Object.entries(RECLAMATION_GRAVITE_META) as [ReclamationGravite, { label: string }][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Responsable traitement</label>
              <input className={inputCls} placeholder="Nom du responsable" value={form.responsable}
                onChange={e => setForm(f => ({ ...f, responsable: e.target.value }))} />
            </div>
          </div>
          <div className="mb-4">
            <label className={labelCls}>Description de la réclamation *</label>
            <textarea className={inputCls} rows={3} placeholder="Décrivez la réclamation..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className={labelCls}>Délai de traitement</label>
              <input type="date" className={inputCls} value={form.delai_traitement}
                onChange={e => setForm(f => ({ ...f, delai_traitement: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Action réalisée (si déjà traitée)</label>
              <input className={inputCls} placeholder="Action corrective..." value={form.action_realisee}
                onChange={e => setForm(f => ({ ...f, action_realisee: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !form.description.trim()}
              className="px-4 py-2 bg-[#1B3A6B] text-white text-sm rounded-lg hover:bg-[#2E5BA8] disabled:opacity-50 transition-colors">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Chargement...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-14 text-center">
          <MessageSquare size={36} className="text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400 mb-1">Aucune réclamation enregistrée</p>
          <p className="text-xs text-slate-300">Les réclamations des parties intéressées apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(r => {
            const partieMeta = RECLAMATION_PARTIE_META[r.partie_type]
            const catMeta = RECLAMATION_CATEGORIE_META[r.categorie]
            const gravMeta = RECLAMATION_GRAVITE_META[r.gravite]
            const statMeta = RECLAMATION_STATUT_META[r.statut]
            const isExpanded = expandedId === r.id
            const isOverdue = r.delai_traitement && new Date(r.delai_traitement) < new Date() && !['resolue', 'cloturee'].includes(r.statut)

            return (
              <div key={r.id} className={`bg-white rounded-xl border transition-all ${r.gravite === 'majeure' && !['resolue', 'cloturee'].includes(r.statut) ? 'border-red-200' : 'border-slate-200'}`}>
                <div
                  className="flex items-center px-5 py-4 gap-4 cursor-pointer hover:bg-slate-50 rounded-xl"
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}>
                  {/* Numero */}
                  <span className="font-mono text-xs text-slate-400 shrink-0 w-24">{r.numero ?? '—'}</span>
                  {/* Partie */}
                  <span className="text-base shrink-0">{partieMeta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{r.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {r.partie_nom && <span className="text-xs text-slate-400">{r.partie_nom}</span>}
                      <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${catMeta.cls}`}>{catMeta.label}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${gravMeta.cls}`}>{gravMeta.label}</span>
                      {isOverdue && <span className="text-xs text-red-500 font-medium">⚠ Délai dépassé</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${statMeta.cls}`}>
                      {statMeta.icon} {statMeta.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(r.date_reception).toLocaleDateString('fr-FR')}
                    </span>
                    <ChevronDown size={14} className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Description complète</p>
                        <p className="text-sm text-slate-700">{r.description}</p>
                      </div>
                      {r.action_realisee && (
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Action réalisée</p>
                          <p className="text-sm text-slate-700">{r.action_realisee}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400 mr-1">Changer statut :</span>
                      {(['recue', 'en_cours', 'resolue', 'cloturee'] as ReclamationStatut[]).map(s => {
                        const m = RECLAMATION_STATUT_META[s]
                        return (
                          <button key={s} onClick={() => updateStatut(r.id, s)}
                            className={`text-xs px-2 py-1 rounded-lg border font-medium transition-all ${r.statut === s ? m.cls + ' ring-2 ring-offset-1 ring-[#1B3A6B]' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}>
                            {m.icon} {m.label}
                          </button>
                        )
                      })}
                      {r.gravite === 'majeure' && !r.nc_id && (
                        <Link
                          href={`/org/${orgId}/qualite/non-conformites/new?source=reclamation&ref=${r.id}&titre=${encodeURIComponent('Réclamation — ' + r.description.slice(0, 60))}`}
                          className="ml-auto inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                          <ExternalLink size={11} /> Générer une NC
                        </Link>
                      )}
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
