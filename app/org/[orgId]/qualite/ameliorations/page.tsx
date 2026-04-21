'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft, Plus, RefreshCw, Loader2, CheckCircle2,
  AlertTriangle, Clock, User, Calendar, Filter, Search, Trash2, X,
} from 'lucide-react'
import {
  AMELIORATION_SOURCE_META, AMELIORATION_PRIORITE_META, AMELIORATION_STATUT_META,
  type AmeliorationSourceType, type AmeliorationPriorite, type AmeliorationStatut,
} from '@/lib/amelioration-templates'

interface Amelioration {
  id: string
  numero: string | null
  titre: string
  description: string | null
  source_type: AmeliorationSourceType
  source_id: string | null
  source_label: string | null
  priorite: AmeliorationPriorite
  statut: AmeliorationStatut
  responsable: string | null
  echeance: string | null
  actions: string | null
  efficacite_verifiee: boolean
  created_at: string
  updated_at: string
}

const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

const PRIORITE_ACCENT: Record<AmeliorationPriorite, string> = {
  critique: 'bg-red-500',
  haute: 'bg-orange-400',
  moyenne: 'bg-amber-400',
  faible: 'bg-slate-300',
}

const STATUT_CYCLE: AmeliorationStatut[] = ['identifiee', 'en_cours', 'realisee']

export default function AmeliorationsPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const supabase = createClient()

  const [items, setItems] = useState<Amelioration[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [filterSource, setFilterSource] = useState<string>('')
  const [filterPriorite, setFilterPriorite] = useState<string>('')
  const [filterStatut, setFilterStatut] = useState<string>('')
  const [search, setSearch] = useState('')

  const [form, setForm] = useState({
    titre: '',
    source_type: 'manuel' as AmeliorationSourceType,
    priorite: 'moyenne' as AmeliorationPriorite,
    responsable: '',
    echeance: '',
    description: '',
    actions: '',
  })

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('ameliorations')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [orgId])

  async function sync() {
    setSyncing(true)
    setSyncMsg(null)

    // Load all sources in parallel
    const [
      { data: ncs },
      { data: risks },
      { data: audits },
      { data: reclamations },
      { data: swot },
      { data: existing },
    ] = await Promise.all([
      supabase.from('nonconformities').select('id, title, severity, status')
        .eq('organization_id', orgId).in('status', ['ouverte', 'en_cours']),
      supabase.from('risks').select('id, title, probability, impact, level, status')
        .eq('organization_id', orgId).not('status', 'eq', 'traite'),
      supabase.from('audit_plans').select('id, process_key, status')
        .eq('organization_id', orgId).eq('status', 'realise'),
      supabase.from('reclamations').select('id, description, gravite, statut')
        .eq('organization_id', orgId).eq('gravite', 'majeure')
        .not('statut', 'in', '("resolue","cloturee")'),
      supabase.from('swot_analyses').select('id, content, type')
        .eq('organization_id', orgId).in('type', ['faiblesse', 'menace']),
      supabase.from('ameliorations').select('source_id')
        .eq('organization_id', orgId).not('source_id', 'is', null),
    ])

    const existingIds = new Set(existing?.map(e => e.source_id) ?? [])

    const inserts: any[] = []
    const year = new Date().getFullYear()
    let counter = items.length

    // NCs → amélioration
    ncs?.filter(nc => !existingIds.has(nc.id)).forEach(nc => {
      counter++
      inserts.push({
        organization_id: orgId,
        numero: `AME-${year}-${String(counter).padStart(3, '0')}`,
        titre: `NC — ${nc.title}`,
        source_type: 'nc',
        source_id: nc.id,
        source_label: nc.title,
        priorite: nc.severity === 'majeure' ? 'critique' : 'haute',
        statut: 'identifiee',
      })
    })

    // Risques critiques/élevés → amélioration
    risks?.filter(r => {
      if (existingIds.has(r.id)) return false
      const score = (r.probability ?? 0) * (r.impact ?? 0)
      return score >= 12 || ['critique', 'eleve'].includes(r.level ?? '')
    }).forEach(r => {
      counter++
      const score = (r.probability ?? 0) * (r.impact ?? 0)
      inserts.push({
        organization_id: orgId,
        numero: `AME-${year}-${String(counter).padStart(3, '0')}`,
        titre: `Risque — ${r.title}`,
        source_type: 'risque',
        source_id: r.id,
        source_label: r.title,
        priorite: score >= 16 ? 'critique' : 'haute',
        statut: 'identifiee',
      })
    })

    // Audits réalisés → amélioration (point de suivi)
    audits?.filter(a => !existingIds.has(a.id)).forEach(a => {
      counter++
      inserts.push({
        organization_id: orgId,
        numero: `AME-${year}-${String(counter).padStart(3, '0')}`,
        titre: `Audit — Suivi processus ${a.process_key ?? ''}`,
        source_type: 'audit',
        source_id: a.id,
        source_label: `Processus ${a.process_key ?? ''}`,
        priorite: 'moyenne',
        statut: 'identifiee',
      })
    })

    // Réclamations majeures → amélioration
    reclamations?.filter(r => !existingIds.has(r.id)).forEach(r => {
      counter++
      inserts.push({
        organization_id: orgId,
        numero: `AME-${year}-${String(counter).padStart(3, '0')}`,
        titre: `Réclamation majeure — ${r.description?.slice(0, 60)}`,
        source_type: 'reclamation',
        source_id: r.id,
        source_label: r.description?.slice(0, 80),
        priorite: 'haute',
        statut: 'identifiee',
      })
    })

    // SWOT faiblesses/menaces → amélioration
    swot?.filter(s => !existingIds.has(s.id)).forEach(s => {
      counter++
      inserts.push({
        organization_id: orgId,
        numero: `AME-${year}-${String(counter).padStart(3, '0')}`,
        titre: `${s.type === 'faiblesse' ? 'Faiblesse' : 'Menace'} SWOT — ${s.content?.slice(0, 60)}`,
        source_type: 'swot',
        source_id: s.id,
        source_label: s.content?.slice(0, 80),
        priorite: 'moyenne',
        statut: 'identifiee',
      })
    })

    if (inserts.length > 0) {
      await supabase.from('ameliorations').insert(inserts)
      setSyncMsg(`✅ ${inserts.length} nouvelle${inserts.length > 1 ? 's' : ''} amélioration${inserts.length > 1 ? 's' : ''} générée${inserts.length > 1 ? 's' : ''} depuis les sources`)
    } else {
      setSyncMsg('✓ Tout est à jour — aucune nouvelle amélioration à générer')
    }

    setSyncing(false)
    load()
    setTimeout(() => setSyncMsg(null), 5000)
  }

  async function saveManual() {
    if (!form.titre.trim()) return
    setSaving(true)
    const year = new Date().getFullYear()
    const numero = `AME-${year}-${String(items.length + 1).padStart(3, '0')}`
    await supabase.from('ameliorations').insert({
      organization_id: orgId,
      numero,
      titre: form.titre,
      source_type: form.source_type,
      priorite: form.priorite,
      statut: 'identifiee',
      responsable: form.responsable || null,
      echeance: form.echeance || null,
      description: form.description || null,
      actions: form.actions || null,
    })
    setForm({ titre: '', source_type: 'manuel', priorite: 'moyenne', responsable: '', echeance: '', description: '', actions: '' })
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function cycleStatut(item: Amelioration) {
    const idx = STATUT_CYCLE.indexOf(item.statut)
    const next = STATUT_CYCLE[(idx + 1) % STATUT_CYCLE.length]
    await supabase.from('ameliorations').update({ statut: next }).eq('id', item.id)
    setItems(prev => prev.map(a => a.id === item.id ? { ...a, statut: next } : a))
  }

  async function toggleEfficacite(item: Amelioration) {
    const val = !item.efficacite_verifiee
    await supabase.from('ameliorations').update({ efficacite_verifiee: val }).eq('id', item.id)
    setItems(prev => prev.map(a => a.id === item.id ? { ...a, efficacite_verifiee: val } : a))
  }

  async function deleteItem(id: string) {
    await supabase.from('ameliorations').delete().eq('id', id)
    setItems(prev => prev.filter(a => a.id !== id))
  }

  // Filtered + sorted list
  const filtered = useMemo(() => {
    let list = [...items]
    if (filterSource) list = list.filter(a => a.source_type === filterSource)
    if (filterPriorite) list = list.filter(a => a.priorite === filterPriorite)
    if (filterStatut) list = list.filter(a => a.statut === filterStatut)
    if (search) list = list.filter(a => a.titre.toLowerCase().includes(search.toLowerCase()))
    list.sort((a, b) => {
      const pOrder = AMELIORATION_PRIORITE_META[a.priorite].order - AMELIORATION_PRIORITE_META[b.priorite].order
      return pOrder !== 0 ? pOrder : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    return list
  }, [items, filterSource, filterPriorite, filterStatut, search])

  const counts = {
    total: items.length,
    en_cours: items.filter(a => a.statut === 'en_cours').length,
    realisees: items.filter(a => a.statut === 'realisee').length,
    taux: items.length > 0 ? Math.round((items.filter(a => a.statut === 'realisee').length / items.length) * 100) : 0,
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
            <h1 className="text-2xl font-bold text-slate-900">Journal d'amélioration</h1>
            <p className="text-slate-500 text-sm mt-0.5">ISO 21001 §10.3 — Plan d'action global consolidé</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={sync} disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-60">
              {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Synchroniser les sources
            </button>
            <button onClick={() => setShowForm(v => !v)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B3A6B] text-white text-sm rounded-lg hover:bg-[#2E5BA8] transition-colors">
              {showForm ? <X size={15} /> : <Plus size={15} />}
              {showForm ? 'Annuler' : 'Ajouter manuellement'}
            </button>
          </div>
        </div>
      </div>

      {/* Sync message */}
      {syncMsg && (
        <div className={`rounded-xl px-4 py-3 flex items-center gap-2 mb-4 text-sm font-medium ${syncMsg.startsWith('✅') ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}>
          {syncMsg}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total', value: counts.total, iconCls: 'bg-slate-100 text-slate-500', cls: 'border-slate-200' },
          { label: 'En cours', value: counts.en_cours, iconCls: 'bg-amber-50 text-amber-500', cls: 'border-amber-100' },
          { label: 'Réalisées', value: counts.realisees, iconCls: 'bg-emerald-50 text-emerald-500', cls: 'border-emerald-100' },
          { label: 'Taux de réalisation', value: `${counts.taux}%`, iconCls: 'bg-blue-50 text-blue-500', cls: 'border-blue-100' },
        ].map(k => (
          <div key={k.label} className={`bg-white rounded-xl border ${k.cls} p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl ${k.iconCls} flex items-center justify-center shrink-0`}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{k.value}</p>
              <p className="text-xs text-slate-500">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {counts.total > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-3 mb-5 flex items-center gap-4">
          <span className="text-xs text-slate-500 shrink-0">Progression globale</span>
          <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-2.5 bg-emerald-400 rounded-full transition-all" style={{ width: `${counts.taux}%` }} />
          </div>
          <span className="text-xs font-bold text-slate-700 shrink-0">{counts.taux}%</span>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
          <h2 className="font-semibold text-slate-800 text-sm mb-4">Ajouter une amélioration</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-2">
              <label className={labelCls}>Titre *</label>
              <input className={inputCls} placeholder="Décrire l'amélioration..."
                value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Source</label>
              <select className={inputCls} value={form.source_type}
                onChange={e => setForm(f => ({ ...f, source_type: e.target.value as AmeliorationSourceType }))}>
                {(Object.entries(AMELIORATION_SOURCE_META) as [AmeliorationSourceType, typeof AMELIORATION_SOURCE_META[AmeliorationSourceType]][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className={labelCls}>Priorité</label>
              <select className={inputCls} value={form.priorite}
                onChange={e => setForm(f => ({ ...f, priorite: e.target.value as AmeliorationPriorite }))}>
                {(Object.entries(AMELIORATION_PRIORITE_META) as [AmeliorationPriorite, typeof AMELIORATION_PRIORITE_META[AmeliorationPriorite]][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Responsable</label>
              <input className={inputCls} placeholder="Nom..." value={form.responsable}
                onChange={e => setForm(f => ({ ...f, responsable: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Échéance</label>
              <input type="date" className={inputCls} value={form.echeance}
                onChange={e => setForm(f => ({ ...f, echeance: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className={labelCls}>Description</label>
              <textarea className={inputCls} rows={2} placeholder="Contexte, cause..."
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Actions prévues</label>
              <textarea className={inputCls} rows={2} placeholder="Actions à mettre en place..."
                value={form.actions} onChange={e => setForm(f => ({ ...f, actions: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={saveManual} disabled={saving || !form.titre.trim()}
              className="px-4 py-2 bg-[#1B3A6B] text-white text-sm rounded-lg hover:bg-[#2E5BA8] disabled:opacity-50 transition-colors">
              {saving ? 'Ajout...' : 'Ajouter'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 mb-4 flex items-center gap-3 flex-wrap">
        <Filter size={14} className="text-slate-400 shrink-0" />
        <div className="relative flex-1 min-w-40">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
            placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
          value={filterSource} onChange={e => setFilterSource(e.target.value)}>
          <option value="">Toutes les sources</option>
          {(Object.entries(AMELIORATION_SOURCE_META) as [AmeliorationSourceType, typeof AMELIORATION_SOURCE_META[AmeliorationSourceType]][]).map(([k, v]) => (
            <option key={k} value={k}>{v.icon} {v.label}</option>
          ))}
        </select>
        <select className="px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
          value={filterPriorite} onChange={e => setFilterPriorite(e.target.value)}>
          <option value="">Toutes priorités</option>
          {(Object.entries(AMELIORATION_PRIORITE_META) as [AmeliorationPriorite, typeof AMELIORATION_PRIORITE_META[AmeliorationPriorite]][]).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select className="px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
          value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
          <option value="">Tous statuts</option>
          {(Object.entries(AMELIORATION_STATUT_META) as [AmeliorationStatut, typeof AMELIORATION_STATUT_META[AmeliorationStatut]][]).map(([k, v]) => (
            <option key={k} value={k}>{v.icon} {v.label}</option>
          ))}
        </select>
        {(filterSource || filterPriorite || filterStatut || search) && (
          <button onClick={() => { setFilterSource(''); setFilterPriorite(''); setFilterStatut(''); setSearch('') }}
            className="text-xs text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        )}
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} / {items.length}</span>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-14 text-center">
          <RefreshCw size={36} className="text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400 mb-2">Aucune amélioration enregistrée</p>
          <p className="text-xs text-slate-300">Cliquez sur "Synchroniser les sources" pour générer automatiquement</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(a => {
            const srcMeta = AMELIORATION_SOURCE_META[a.source_type]
            const priMeta = AMELIORATION_PRIORITE_META[a.priorite]
            const statMeta = AMELIORATION_STATUT_META[a.statut]
            const isExpanded = expandedId === a.id
            const isOverdue = a.echeance && new Date(a.echeance) < new Date() && a.statut !== 'realisee'

            return (
              <div key={a.id} className="bg-white rounded-xl border border-slate-200 flex overflow-hidden">
                {/* Accent bar */}
                <div className={`w-1 shrink-0 ${PRIORITE_ACCENT[a.priorite]}`} />
                <div className="flex-1">
                  <div className="flex items-center px-4 py-3.5 gap-3 cursor-pointer hover:bg-slate-50"
                    onClick={() => setExpandedId(isExpanded ? null : a.id)}>
                    <span className="font-mono text-xs text-slate-300 shrink-0 w-20">{a.numero}</span>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${srcMeta.cls}`}>
                      {srcMeta.icon} {srcMeta.label}
                    </span>
                    <span className="flex-1 text-sm font-medium text-slate-800 truncate">{a.titre}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {isOverdue && <AlertTriangle size={13} className="text-red-400" />}
                      <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${priMeta.cls}`}>{priMeta.label}</span>
                      <button onClick={e => { e.stopPropagation(); cycleStatut(a) }}
                        className={`text-xs px-2 py-1 rounded-lg border font-medium transition-all hover:opacity-80 ${statMeta.cls}`}>
                        {statMeta.icon} {statMeta.label}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                      {a.source_label && (
                        <p className="text-xs text-slate-400 italic mb-2">Source : {a.source_label}</p>
                      )}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {a.description && (
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Description</p>
                            <p className="text-sm text-slate-700">{a.description}</p>
                          </div>
                        )}
                        {a.actions && (
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Actions</p>
                            <p className="text-sm text-slate-700">{a.actions}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                        {a.responsable && <span className="flex items-center gap-1"><User size={11} /> {a.responsable}</span>}
                        {a.echeance && <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : ''}`}><Calendar size={11} /> {new Date(a.echeance).toLocaleDateString('fr-FR')}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        {a.statut === 'realisee' && (
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                            <input type="checkbox" checked={a.efficacite_verifiee}
                              onChange={() => toggleEfficacite(a)}
                              className="w-3.5 h-3.5 accent-emerald-600" />
                            Efficacité vérifiée
                          </label>
                        )}
                        <button onClick={() => deleteItem(a.id)}
                          className="ml-auto inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 size={12} /> Supprimer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
