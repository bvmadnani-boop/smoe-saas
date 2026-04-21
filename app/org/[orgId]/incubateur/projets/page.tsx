'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Plus, Lightbulb, X, ChevronRight } from 'lucide-react'
import {
  PROJET_STADE_META, STADE_PIPELINE, PROJET_SECTEURS,
  calculateScoreMaturite, type ProjetStade,
} from '@/lib/incubateur-templates'

interface Projet {
  id: string; nom: string; description: string | null; secteur: string | null
  stade: ProjetStade; score_maturite: number
  business_model: boolean; prototype: boolean
  premier_client: boolean; financement_obtenu: boolean; equipe_complete: boolean
  date_entree: string; created_at: string
}

const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

export default function ProjetsPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const supabase = createClient()

  const [projets, setProjets] = useState<Projet[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterStade, setFilterStade] = useState<string>('')

  const [form, setForm] = useState({
    nom: '', description: '', secteur: '', stade: 'ideation' as ProjetStade, date_entree: new Date().toISOString().split('T')[0],
  })

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('incubateur_projets').select('*')
      .eq('organization_id', orgId).order('created_at', { ascending: false })
    setProjets(data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [orgId])

  async function save() {
    if (!form.nom.trim()) return
    setSaving(true)
    await supabase.from('incubateur_projets').insert({
      organization_id: orgId, nom: form.nom,
      description: form.description || null, secteur: form.secteur || null,
      stade: form.stade, date_entree: form.date_entree, score_maturite: 0,
    })
    setForm({ nom: '', description: '', secteur: '', stade: 'ideation', date_entree: new Date().toISOString().split('T')[0] })
    setShowForm(false); setSaving(false); load()
  }

  const filtered = filterStade ? projets.filter(p => p.stade === filterStade) : projets

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href={`/org/${orgId}/incubateur`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#1B3A6B] mb-3 transition-colors">
          <ArrowLeft size={13} /> Incubateur
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Projets incubés</h1>
            <p className="text-slate-500 text-sm mt-0.5">De l'idée au lancement — chaque projet a son parcours</p>
          </div>
          <button onClick={() => setShowForm(v => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B3A6B] text-white text-sm rounded-lg hover:bg-[#2E5BA8] transition-colors">
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? 'Annuler' : 'Nouveau projet'}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
          <h2 className="font-semibold text-slate-800 text-sm mb-4">Nouveau projet</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-2">
              <label className={labelCls}>Nom du projet *</label>
              <input className={inputCls} placeholder="Ex: AgriConnect, EduBot..." value={form.nom}
                onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Secteur</label>
              <select className={inputCls} value={form.secteur} onChange={e => setForm(f => ({ ...f, secteur: e.target.value }))}>
                <option value="">— Sélectionner —</option>
                {PROJET_SECTEURS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className={labelCls}>Stade initial</label>
              <select className={inputCls} value={form.stade} onChange={e => setForm(f => ({ ...f, stade: e.target.value as ProjetStade }))}>
                {STADE_PIPELINE.map(s => (
                  <option key={s} value={s}>{PROJET_STADE_META[s].icon} {PROJET_STADE_META[s].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Date d'entrée</label>
              <input type="date" className={inputCls} value={form.date_entree}
                onChange={e => setForm(f => ({ ...f, date_entree: e.target.value }))} />
            </div>
          </div>
          <div className="mb-5">
            <label className={labelCls}>Description</label>
            <textarea className={inputCls} rows={2} placeholder="Problème adressé, solution proposée..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !form.nom.trim()}
              className="px-4 py-2 bg-[#1B3A6B] text-white text-sm rounded-lg hover:bg-[#2E5BA8] disabled:opacity-50 transition-colors">
              {saving ? 'Création...' : 'Créer le projet'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Filtre stades */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {['', ...STADE_PIPELINE, 'abandonne'].map(s => {
          const meta = s ? PROJET_STADE_META[s as ProjetStade] : null
          return (
            <button key={s} onClick={() => setFilterStade(s)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${filterStade === s ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
              {s === '' ? 'Tous' : `${meta!.icon} ${meta!.label}`}
            </button>
          )
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-14 text-center">
          <Lightbulb size={36} className="text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Aucun projet incubé</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(pr => {
            const stageMeta = PROJET_STADE_META[pr.stade]
            const scoreBarCls = pr.score_maturite < 40 ? 'bg-slate-400' : pr.score_maturite < 70 ? 'bg-amber-400' : 'bg-emerald-400'
            const stageIdx = STADE_PIPELINE.indexOf(pr.stade)
            return (
              <Link key={pr.id} href={`/org/${orgId}/incubateur/projets/${pr.id}`}
                className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 hover:border-[#1B3A6B]/30 hover:shadow-sm transition-all group block">
                <div className="w-12 h-12 rounded-xl bg-[#1B3A6B]/8 flex items-center justify-center shrink-0 text-2xl">
                  {stageMeta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-base font-bold text-slate-800 group-hover:text-[#1B3A6B] transition-colors">{pr.nom}</p>
                    {pr.secteur && <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{pr.secteur}</span>}
                  </div>
                  {pr.description && <p className="text-xs text-slate-500 truncate mb-2">{pr.description}</p>}
                  {/* Pipeline progress */}
                  <div className="flex items-center gap-1">
                    {STADE_PIPELINE.map((s, i) => (
                      <div key={s} className={`h-1.5 rounded-full flex-1 transition-all ${i <= stageIdx && pr.stade !== 'abandonne' ? 'bg-[#1B3A6B]' : 'bg-slate-100'}`} />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${stageMeta.cls}`}>
                    {stageMeta.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Maturité</span>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-1.5 rounded-full ${scoreBarCls}`} style={{ width: `${pr.score_maturite}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{pr.score_maturite}%</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-[#1B3A6B] transition-colors" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
