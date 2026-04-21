'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Plus, BookOpen, Users, X, ChevronDown, CheckCircle2 } from 'lucide-react'
import {
  ATELIER_TYPE_META, ATELIER_CATALOGUE,
  type AtelierType,
} from '@/lib/career-templates'

interface Atelier {
  id: string
  titre: string
  type: AtelierType
  objectif: string | null
  animateur: string | null
  date_atelier: string | null
  duree_minutes: number | null
  lieu: string | null
  nb_places: number | null
  nb_inscrits: number
  statut: 'planifie' | 'realise' | 'annule'
}

const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

const STATUT_META = {
  planifie: { label: 'Planifié',  cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  realise:  { label: 'Réalisé',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  annule:   { label: 'Annulé',   cls: 'bg-slate-100 text-slate-400 border-slate-200' },
}

export default function AteliersPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const supabase = createClient()

  const [ateliers, setAteliers] = useState<Atelier[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedCatalogue, setSelectedCatalogue] = useState<number | null>(null)

  const [form, setForm] = useState({
    titre: '', type: 'cv_lm' as AtelierType, objectif: '',
    animateur: '', date_atelier: '', duree_minutes: '',
    lieu: '', nb_places: '',
  })

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('career_ateliers').select('*')
      .eq('organization_id', orgId).order('date_atelier', { ascending: false })
    setAteliers(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [orgId])

  function pickCatalogue(i: number) {
    const c = ATELIER_CATALOGUE[i]
    setSelectedCatalogue(i)
    setForm(f => ({
      ...f, titre: c.titre, type: c.type,
      objectif: c.objectif, duree_minutes: String(c.duree_minutes),
    }))
  }

  async function save() {
    if (!form.titre.trim()) return
    setSaving(true)
    await supabase.from('career_ateliers').insert({
      organization_id: orgId,
      titre: form.titre, type: form.type, objectif: form.objectif || null,
      animateur: form.animateur || null,
      date_atelier: form.date_atelier || null,
      duree_minutes: form.duree_minutes ? parseInt(form.duree_minutes) : null,
      lieu: form.lieu || null,
      nb_places: form.nb_places ? parseInt(form.nb_places) : null,
      statut: 'planifie',
    })
    setForm({ titre: '', type: 'cv_lm', objectif: '', animateur: '', date_atelier: '', duree_minutes: '', lieu: '', nb_places: '' })
    setSelectedCatalogue(null)
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function updateStatut(id: string, statut: Atelier['statut']) {
    await supabase.from('career_ateliers').update({ statut }).eq('id', id)
    setAteliers(prev => prev.map(a => a.id === id ? { ...a, statut } : a))
  }

  const counts = {
    total: ateliers.length,
    planifie: ateliers.filter(a => a.statut === 'planifie').length,
    realise: ateliers.filter(a => a.statut === 'realise').length,
    total_inscrits: ateliers.reduce((acc, a) => acc + a.nb_inscrits, 0),
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href={`/org/${orgId}/career-centre`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#1B3A6B] mb-3 transition-colors">
          <ArrowLeft size={13} /> Career Centre
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ateliers d'employabilité</h1>
            <p className="text-slate-500 text-sm mt-0.5">CV, entretien, LinkedIn, soft skills… chaque atelier = +10 pts au score</p>
          </div>
          <button onClick={() => setShowForm(v => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B3A6B] text-white text-sm rounded-lg hover:bg-[#2E5BA8] transition-colors">
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? 'Annuler' : 'Nouvel atelier'}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total ateliers',  value: counts.total,         cls: 'border-slate-200',   iconCls: 'bg-slate-100 text-slate-500' },
          { label: 'Planifiés',       value: counts.planifie,      cls: 'border-blue-100',    iconCls: 'bg-blue-50 text-blue-500' },
          { label: 'Réalisés',        value: counts.realise,       cls: 'border-emerald-100', iconCls: 'bg-emerald-50 text-emerald-500' },
          { label: 'Total inscrits',  value: counts.total_inscrits,cls: 'border-violet-100',  iconCls: 'bg-violet-50 text-violet-500' },
        ].map(({ label, value, cls, iconCls }) => (
          <div key={label} className={`bg-white rounded-xl border ${cls} p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl ${iconCls} flex items-center justify-center shrink-0`}><BookOpen size={18} /></div>
            <div><p className="text-xl font-bold text-slate-900">{value}</p><p className="text-xs text-slate-500">{label}</p></div>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
          <h2 className="font-semibold text-slate-800 text-sm mb-3">Depuis le catalogue</h2>
          <div className="grid grid-cols-4 gap-2 mb-5">
            {ATELIER_CATALOGUE.map((c, i) => {
              const meta = ATELIER_TYPE_META[c.type]
              return (
                <button key={i} onClick={() => pickCatalogue(i)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${selectedCatalogue === i ? 'border-[#1B3A6B] bg-[#1B3A6B]/5' : 'border-slate-200 hover:border-slate-300'}`}>
                  <span className="text-xl block mb-1">{meta.icon}</span>
                  <p className="text-xs font-semibold text-slate-700 leading-tight">{c.titre}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{c.duree_minutes} min</p>
                </button>
              )
            })}
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-2">
              <label className={labelCls}>Titre *</label>
              <input className={inputCls} value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <select className={inputCls} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as AtelierType }))}>
                {(Object.entries(ATELIER_TYPE_META) as [AtelierType, typeof ATELIER_TYPE_META[AtelierType]][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div><label className={labelCls}>Date</label><input type="date" className={inputCls} value={form.date_atelier} onChange={e => setForm(f => ({ ...f, date_atelier: e.target.value }))} /></div>
            <div><label className={labelCls}>Durée (min)</label><input type="number" className={inputCls} value={form.duree_minutes} onChange={e => setForm(f => ({ ...f, duree_minutes: e.target.value }))} /></div>
            <div><label className={labelCls}>Lieu</label><input className={inputCls} value={form.lieu} onChange={e => setForm(f => ({ ...f, lieu: e.target.value }))} /></div>
            <div><label className={labelCls}>Places</label><input type="number" className={inputCls} value={form.nb_places} onChange={e => setForm(f => ({ ...f, nb_places: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div><label className={labelCls}>Animateur</label><input className={inputCls} value={form.animateur} onChange={e => setForm(f => ({ ...f, animateur: e.target.value }))} /></div>
            <div><label className={labelCls}>Objectif</label><input className={inputCls} value={form.objectif} onChange={e => setForm(f => ({ ...f, objectif: e.target.value }))} /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !form.titre.trim()}
              className="px-4 py-2 bg-[#1B3A6B] text-white text-sm rounded-lg hover:bg-[#2E5BA8] disabled:opacity-50 transition-colors">
              {saving ? 'Création...' : 'Créer l\'atelier'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 transition-colors">Annuler</button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Chargement...</div>
      ) : ateliers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-14 text-center">
          <BookOpen size={36} className="text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400 mb-1">Aucun atelier créé</p>
          <p className="text-xs text-slate-300">Choisissez un template depuis le catalogue</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ateliers.map(a => {
            const typeMeta = ATELIER_TYPE_META[a.type]
            const statMeta = STATUT_META[a.statut]
            const isExpanded = expandedId === a.id
            return (
              <div key={a.id} className="bg-white rounded-xl border border-slate-200">
                <div className="flex items-center px-5 py-4 gap-3 cursor-pointer hover:bg-slate-50 rounded-xl"
                  onClick={() => setExpandedId(isExpanded ? null : a.id)}>
                  <span className="text-xl shrink-0">{typeMeta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{a.titre}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${typeMeta.cls}`}>{typeMeta.label}</span>
                      {a.animateur && <span className="text-xs text-slate-400">{a.animateur}</span>}
                      {a.nb_inscrits > 0 && <span className="flex items-center gap-1 text-xs text-slate-400"><Users size={10} /> {a.nb_inscrits}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {a.date_atelier && <span className="text-xs text-slate-400">{new Date(a.date_atelier).toLocaleDateString('fr-FR')}</span>}
                    {a.duree_minutes && <span className="text-xs text-slate-400">{a.duree_minutes} min</span>}
                    <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${statMeta.cls}`}>{statMeta.label}</span>
                    <ChevronDown size={14} className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-slate-100 pt-3">
                    {a.objectif && <p className="text-xs text-slate-600 mb-3">🎯 {a.objectif}</p>}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400 mr-1">Statut :</span>
                      {(['planifie', 'realise', 'annule'] as const).map(s => (
                        <button key={s} onClick={() => updateStatut(a.id, s)}
                          className={`text-xs px-2 py-1 rounded-lg border font-medium transition-all ${a.statut === s ? STATUT_META[s].cls + ' ring-2 ring-offset-1 ring-[#1B3A6B]' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}>
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
