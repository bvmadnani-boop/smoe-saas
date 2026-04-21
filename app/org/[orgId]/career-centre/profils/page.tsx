'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft, Plus, Users, Star, TrendingUp,
  X, ChevronDown, CheckCircle2, Circle,
} from 'lucide-react'
import {
  NIVEAU_META, SCORE_ITEMS, calculateScore, getNiveau,
  type NiveauEmployabilite,
} from '@/lib/career-templates'

interface Profil {
  id: string
  etudiant_nom: string
  etudiant_email: string | null
  filiere_id: string | null
  promotion: string | null
  score: number
  niveau: NiveauEmployabilite
  cv_valide: boolean
  experience_pro: boolean
  soft_skills_done: boolean
  ateliers_count: number
  mentoring_count: number
  poste_vise: string | null
  secteur_vise: string | null
  notes_career: string | null
  date_insertion: string | null
  entreprise_insertion: string | null
  created_at: string
}

interface Filiere { id: string; name: string }

const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

export default function ProfilsPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const supabase = createClient()

  const [profils, setProfils] = useState<Profil[]>([])
  const [filieres, setFilieres] = useState<Filiere[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterNiveau, setFilterNiveau] = useState('')

  const [form, setForm] = useState({
    etudiant_nom: '', etudiant_email: '', filiere_id: '',
    promotion: '', poste_vise: '', secteur_vise: '',
  })

  async function load() {
    setLoading(true)
    const [{ data: p }, { data: f }] = await Promise.all([
      supabase.from('career_profils').select('*').eq('organization_id', orgId).order('score', { ascending: false }),
      supabase.from('filieres').select('id, name').eq('organization_id', orgId),
    ])
    setProfils(p ?? [])
    setFilieres(f ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [orgId])

  async function save() {
    if (!form.etudiant_nom.trim()) return
    setSaving(true)
    await supabase.from('career_profils').insert({
      organization_id: orgId,
      etudiant_nom: form.etudiant_nom,
      etudiant_email: form.etudiant_email || null,
      filiere_id: form.filiere_id || null,
      promotion: form.promotion || null,
      poste_vise: form.poste_vise || null,
      secteur_vise: form.secteur_vise || null,
      score: 0, niveau: 'debutant',
    })
    setForm({ etudiant_nom: '', etudiant_email: '', filiere_id: '', promotion: '', poste_vise: '', secteur_vise: '' })
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function toggleBool(profil: Profil, field: 'cv_valide' | 'experience_pro' | 'soft_skills_done') {
    const updated = { ...profil, [field]: !profil[field] }
    const newScore = calculateScore({
      cv_valide: updated.cv_valide,
      ateliers_count: updated.ateliers_count,
      experience_pro: updated.experience_pro,
      mentoring_count: updated.mentoring_count,
      soft_skills_done: updated.soft_skills_done,
    })
    const newNiveau = getNiveau(newScore)
    await supabase.from('career_profils').update({
      [field]: !profil[field], score: newScore, niveau: newNiveau,
    }).eq('id', profil.id)
    setProfils(prev => prev.map(p => p.id === profil.id ? { ...updated, score: newScore, niveau: newNiveau } : p))
  }

  const filtered = filterNiveau ? profils.filter(p => p.niveau === filterNiveau) : profils

  const stats = {
    total: profils.length,
    score_moyen: profils.length > 0 ? Math.round(profils.reduce((a, b) => a + b.score, 0) / profils.length) : 0,
    taux_insertion: profils.length > 0 ? Math.round((profils.filter(p => p.date_insertion).length / profils.length) * 100) : 0,
    inserable: profils.filter(p => p.niveau === 'inserable').length,
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
            <h1 className="text-2xl font-bold text-slate-900">Profils d'employabilité</h1>
            <p className="text-slate-500 text-sm mt-0.5">Score individuel · Suivi de progression · Insertion</p>
          </div>
          <button onClick={() => setShowForm(v => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B3A6B] text-white text-sm rounded-lg hover:bg-[#2E5BA8] transition-colors">
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? 'Annuler' : 'Nouveau profil'}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Étudiants suivis',  value: stats.total,                icon: Users,      cls: 'border-slate-200',   iconCls: 'bg-slate-100 text-slate-500' },
          { label: 'Score moyen',       value: `${stats.score_moyen}/100`, icon: Star,       cls: 'border-amber-100',   iconCls: 'bg-amber-50 text-amber-500' },
          { label: 'Taux d\'insertion', value: `${stats.taux_insertion}%`, icon: TrendingUp, cls: 'border-emerald-100', iconCls: 'bg-emerald-50 text-emerald-500' },
          { label: 'Niveau Insérable',  value: stats.inserable,            icon: CheckCircle2,cls: 'border-blue-100',    iconCls: 'bg-blue-50 text-blue-500' },
        ].map(({ label, value, icon: Icon, cls, iconCls }) => (
          <div key={label} className={`bg-white rounded-xl border ${cls} p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl ${iconCls} flex items-center justify-center shrink-0`}><Icon size={18} /></div>
            <div><p className="text-xl font-bold text-slate-900">{value}</p><p className="text-xs text-slate-500">{label}</p></div>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
          <h2 className="font-semibold text-slate-800 text-sm mb-4">Nouveau profil étudiant</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-2">
              <label className={labelCls}>Nom complet *</label>
              <input className={inputCls} placeholder="Prénom Nom" value={form.etudiant_nom}
                onChange={e => setForm(f => ({ ...f, etudiant_nom: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" className={inputCls} placeholder="email@..." value={form.etudiant_email}
                onChange={e => setForm(f => ({ ...f, etudiant_email: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className={labelCls}>Filière</label>
              <select className={inputCls} value={form.filiere_id}
                onChange={e => setForm(f => ({ ...f, filiere_id: e.target.value }))}>
                <option value="">— Sélectionner —</option>
                {filieres.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Promotion</label>
              <input className={inputCls} placeholder="ex: 2024-2025" value={form.promotion}
                onChange={e => setForm(f => ({ ...f, promotion: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Secteur visé</label>
              <input className={inputCls} placeholder="ex: IT, Finance..." value={form.secteur_vise}
                onChange={e => setForm(f => ({ ...f, secteur_vise: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !form.etudiant_nom.trim()}
              className="px-4 py-2 bg-[#1B3A6B] text-white text-sm rounded-lg hover:bg-[#2E5BA8] disabled:opacity-50 transition-colors">
              {saving ? 'Ajout...' : 'Créer le profil'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Filtre niveau */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-slate-400">Filtrer :</span>
        {['', ...Object.keys(NIVEAU_META)].map(n => (
          <button key={n} onClick={() => setFilterNiveau(n)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-medium ${filterNiveau === n ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
            {n === '' ? 'Tous' : `${NIVEAU_META[n as NiveauEmployabilite].icon} ${NIVEAU_META[n as NiveauEmployabilite].label}`}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-14 text-center">
          <Users size={36} className="text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Aucun profil étudiant</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(profil => {
            const nMeta = NIVEAU_META[profil.niveau]
            const isExpanded = expandedId === profil.id
            const scoreBarCls = profil.score < 26 ? 'bg-slate-400' : profil.score < 51 ? 'bg-amber-400' : profil.score < 76 ? 'bg-blue-400' : 'bg-emerald-400'

            return (
              <div key={profil.id} className="bg-white rounded-xl border border-slate-200">
                <div className="flex items-center px-5 py-4 gap-4 cursor-pointer hover:bg-slate-50 rounded-xl"
                  onClick={() => setExpandedId(isExpanded ? null : profil.id)}>
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-[#1B3A6B]/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-[#1B3A6B]">{profil.etudiant_nom.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{profil.etudiant_nom}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {profil.promotion && <span className="text-xs text-slate-400">{profil.promotion}</span>}
                      {profil.secteur_vise && <span className="text-xs text-slate-400">• {profil.secteur_vise}</span>}
                    </div>
                  </div>
                  {/* Score bar */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Score</span>
                        <span className="font-bold text-slate-700">{profil.score}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-1.5 rounded-full ${scoreBarCls}`} style={{ width: `${profil.score}%` }} />
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${nMeta.cls}`}>
                      {nMeta.icon} {nMeta.label}
                    </span>
                  </div>
                  {profil.date_insertion && (
                    <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded font-medium shrink-0">✓ Inséré</span>
                  )}
                  <ChevronDown size={14} className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Critères de score</p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {/* Boolean toggles */}
                      {(['cv_valide', 'experience_pro', 'soft_skills_done'] as const).map(field => {
                        const item = SCORE_ITEMS.find(i => i.key === field)!
                        return (
                          <button key={field} onClick={() => toggleBool(profil, field)}
                            className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all text-sm ${profil[field] ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                            {profil[field] ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                            <span className="flex-1 text-xs">{item.label}</span>
                            <span className="text-xs font-bold shrink-0">+{item.points}</span>
                          </button>
                        )
                      })}
                      {/* Count displays */}
                      <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <p className="text-xs text-slate-500">Ateliers suivis</p>
                        <p className="text-sm font-bold text-slate-700 mt-0.5">{profil.ateliers_count} × +10 pts <span className="text-xs font-normal text-slate-400">(max 30)</span></p>
                      </div>
                      <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <p className="text-xs text-slate-500">Sessions mentoring</p>
                        <p className="text-sm font-bold text-slate-700 mt-0.5">{profil.mentoring_count} × +5 pts <span className="text-xs font-normal text-slate-400">(max 15)</span></p>
                      </div>
                    </div>
                    {profil.date_insertion && (
                      <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                        <p className="text-xs font-semibold text-emerald-700">✓ Inséré le {new Date(profil.date_insertion).toLocaleDateString('fr-FR')}</p>
                        {profil.entreprise_insertion && <p className="text-xs text-emerald-600 mt-0.5">→ {profil.entreprise_insertion}</p>}
                      </div>
                    )}
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
