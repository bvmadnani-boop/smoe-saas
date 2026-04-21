'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Plus, Award, X, ChevronDown } from 'lucide-react'
import { MENTORING_STATUT_META, type MentoringStatut } from '@/lib/career-templates'

interface Profil { id: string; etudiant_nom: string }
interface Session {
  id: string; profil_id: string; mentor_nom: string
  mentor_poste: string | null; mentor_entreprise: string | null
  date_session: string | null; duree_minutes: number | null
  theme: string | null; statut: MentoringStatut
  feedback_etudiant: string | null; feedback_mentor: string | null
}

const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

export default function MentoringPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const supabase = createClient()
  const [sessions, setSessions] = useState<Session[]>([])
  const [profils, setProfils] = useState<Profil[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [form, setForm] = useState({ profil_id: '', mentor_nom: '', mentor_poste: '', mentor_entreprise: '', date_session: '', duree_minutes: '', theme: '' })

  async function load() {
    setLoading(true)
    const [{ data: s }, { data: p }] = await Promise.all([
      supabase.from('career_mentoring').select('*').eq('organization_id', orgId).order('date_session', { ascending: false }),
      supabase.from('career_profils').select('id, etudiant_nom').eq('organization_id', orgId).order('etudiant_nom'),
    ])
    setSessions(s ?? []); setProfils(p ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [orgId])

  async function save() {
    if (!form.profil_id || !form.mentor_nom.trim()) return
    setSaving(true)
    await supabase.from('career_mentoring').insert({ organization_id: orgId, profil_id: form.profil_id, mentor_nom: form.mentor_nom, mentor_poste: form.mentor_poste || null, mentor_entreprise: form.mentor_entreprise || null, date_session: form.date_session || null, duree_minutes: form.duree_minutes ? parseInt(form.duree_minutes) : null, theme: form.theme || null, statut: 'planifiee' })
    setForm({ profil_id: '', mentor_nom: '', mentor_poste: '', mentor_entreprise: '', date_session: '', duree_minutes: '', theme: '' })
    setShowForm(false); setSaving(false); load()
  }

  async function updateStatut(id: string, profil_id: string, statut: MentoringStatut) {
    await supabase.from('career_mentoring').update({ statut }).eq('id', id)
    setSessions(prev => prev.map(s => s.id === id ? { ...s, statut } : s))
    // Si réalisée, incrémenter le compteur mentoring du profil
    if (statut === 'realisee') {
      const profil = profils.find(p => p.id === profil_id)
      if (profil) {
        const { data: pr } = await supabase.from('career_profils').select('mentoring_count, score').eq('id', profil_id).single()
        if (pr) {
          const newCount = (pr.mentoring_count ?? 0) + 1
          const bonusScore = Math.min(newCount * 5, 15)
          await supabase.from('career_profils').update({ mentoring_count: newCount }).eq('id', profil_id)
        }
      }
    }
  }

  const counts = { total: sessions.length, planifiee: sessions.filter(s => s.statut === 'planifiee').length, realisee: sessions.filter(s => s.statut === 'realisee').length }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href={`/org/${orgId}/career-centre`} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#1B3A6B] mb-3 transition-colors"><ArrowLeft size={13} /> Career Centre</Link>
        <div className="flex items-start justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Mentoring Alumni→Étudiant</h1><p className="text-slate-500 text-sm mt-0.5">Chaque session réalisée = +5 pts au score d'employabilité (max 15 pts)</p></div>
          <button onClick={() => setShowForm(v => !v)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B3A6B] text-white text-sm rounded-lg hover:bg-[#2E5BA8] transition-colors">
            {showForm ? <X size={15} /> : <Plus size={15} />}{showForm ? 'Annuler' : 'Planifier une session'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total sessions', value: counts.total, cls: 'border-slate-200', iconCls: 'bg-slate-100 text-slate-500' },
          { label: 'Planifiées', value: counts.planifiee, cls: 'border-blue-100', iconCls: 'bg-blue-50 text-blue-500' },
          { label: 'Réalisées', value: counts.realisee, cls: 'border-emerald-100', iconCls: 'bg-emerald-50 text-emerald-500' },
        ].map(k => (
          <div key={k.label} className={`bg-white rounded-xl border ${k.cls} p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl ${k.iconCls} flex items-center justify-center shrink-0`}><Award size={18} /></div>
            <div><p className="text-xl font-bold text-slate-900">{k.value}</p><p className="text-xs text-slate-500">{k.label}</p></div>
          </div>
        ))}
      </div>
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
          <h2 className="font-semibold text-slate-800 text-sm mb-4">Nouvelle session de mentoring</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div><label className={labelCls}>Étudiant *</label>
              <select className={inputCls} value={form.profil_id} onChange={e => setForm(f => ({ ...f, profil_id: e.target.value }))}>
                <option value="">— Sélectionner —</option>
                {profils.map(p => <option key={p.id} value={p.id}>{p.etudiant_nom}</option>)}
              </select>
            </div>
            <div className="col-span-2"><label className={labelCls}>Mentor (nom) *</label><input className={inputCls} placeholder="Nom du mentor alumni" value={form.mentor_nom} onChange={e => setForm(f => ({ ...f, mentor_nom: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div><label className={labelCls}>Poste du mentor</label><input className={inputCls} placeholder="ex: Directeur IT" value={form.mentor_poste} onChange={e => setForm(f => ({ ...f, mentor_poste: e.target.value }))} /></div>
            <div><label className={labelCls}>Entreprise du mentor</label><input className={inputCls} value={form.mentor_entreprise} onChange={e => setForm(f => ({ ...f, mentor_entreprise: e.target.value }))} /></div>
            <div><label className={labelCls}>Thème</label><input className={inputCls} placeholder="ex: Orientation, CV, entretien..." value={form.theme} onChange={e => setForm(f => ({ ...f, theme: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div><label className={labelCls}>Date</label><input type="date" className={inputCls} value={form.date_session} onChange={e => setForm(f => ({ ...f, date_session: e.target.value }))} /></div>
            <div><label className={labelCls}>Durée (min)</label><input type="number" className={inputCls} value={form.duree_minutes} onChange={e => setForm(f => ({ ...f, duree_minutes: e.target.value }))} /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !form.profil_id || !form.mentor_nom.trim()} className="px-4 py-2 bg-[#1B3A6B] text-white text-sm rounded-lg hover:bg-[#2E5BA8] disabled:opacity-50 transition-colors">{saving ? 'Planification...' : 'Planifier'}</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 transition-colors">Annuler</button>
          </div>
        </div>
      )}
      {loading ? <div className="text-center py-12 text-slate-400 text-sm">Chargement...</div> : sessions.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-14 text-center"><Award size={36} className="text-slate-200 mx-auto mb-3" /><p className="text-sm text-slate-400">Aucune session planifiée</p></div>
      ) : (
        <div className="space-y-2">
          {sessions.map(s => {
            const statMeta = MENTORING_STATUT_META[s.statut]
            const etudiant = profils.find(p => p.id === s.profil_id)
            const isExpanded = expandedId === s.id
            return (
              <div key={s.id} className="bg-white rounded-xl border border-slate-200">
                <div className="flex items-center px-5 py-4 gap-3 cursor-pointer hover:bg-slate-50 rounded-xl" onClick={() => setExpandedId(isExpanded ? null : s.id)}>
                  <div className="w-9 h-9 rounded-full bg-[#1B3A6B]/10 flex items-center justify-center shrink-0"><span className="text-sm font-bold text-[#1B3A6B]">{s.mentor_nom.charAt(0)}</span></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{s.mentor_nom} → {etudiant?.etudiant_nom ?? '—'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {s.mentor_poste && <span className="text-xs text-slate-400">{s.mentor_poste}</span>}
                      {s.mentor_entreprise && <span className="text-xs text-slate-400">· {s.mentor_entreprise}</span>}
                      {s.theme && <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">📌 {s.theme}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {s.date_session && <span className="text-xs text-slate-400">{new Date(s.date_session).toLocaleDateString('fr-FR')}</span>}
                    {s.duree_minutes && <span className="text-xs text-slate-400">{s.duree_minutes} min</span>}
                    <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${statMeta.cls}`}>{statMeta.icon} {statMeta.label}</span>
                    <ChevronDown size={14} className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400 mr-1">Marquer comme :</span>
                      {(['planifiee', 'realisee', 'annulee'] as MentoringStatut[]).map(st => (
                        <button key={st} onClick={() => updateStatut(s.id, s.profil_id, st)}
                          className={`text-xs px-2 py-1 rounded-lg border font-medium transition-all ${s.statut === st ? MENTORING_STATUT_META[st].cls + ' ring-2 ring-offset-1 ring-[#1B3A6B]' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}>
                          {MENTORING_STATUT_META[st].icon} {MENTORING_STATUT_META[st].label}
                        </button>
                      ))}
                      {s.statut === 'realisee' && <span className="ml-auto text-xs text-emerald-600 font-medium">✓ +5 pts score étudiant</span>}
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
