'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft, Plus, X, ChevronDown, CheckCircle2, Circle,
  Users, Trophy, DollarSign, Flag, MessageSquare,
} from 'lucide-react'
import AIAssistant from '@/components/incubateur/AIAssistant'
import {
  PROJET_STADE_META, STADE_PIPELINE, SCORE_MATURITE_ITEMS,
  BESOIN_META, SESSION_THEME_META, PITCH_TYPE_META,
  FINANCEMENT_TYPE_META, FINANCEMENT_STATUT_META,
  JALON_STATUT_META, PORTEUR_ROLES, calculateScoreMaturite,
  type ProjetStade, type BesoinType, type SessionTheme,
  type PitchType, type FinancementType, type FinancementStatut, type JalonStatut,
} from '@/lib/incubateur-templates'

// ─── TYPES ────────────────────────────────────────────────────────────────
interface Projet {
  id: string; nom: string; description: string | null; secteur: string | null
  stade: ProjetStade; score_maturite: number; site_web: string | null
  business_model: boolean; prototype: boolean
  premier_client: boolean; financement_obtenu: boolean; equipe_complete: boolean
  besoins: BesoinType[]; date_entree: string
}
interface Porteur { id: string; nom: string; email: string | null; role: string; profil_id: string | null }
interface Session { id: string; expert_nom: string; expert_titre: string | null; theme: SessionTheme; date_session: string | null; duree_minutes: number | null; compte_rendu: string | null; actions_suivantes: string | null }
interface Pitch { id: string; titre: string; type: PitchType; date_pitch: string | null; jury: string | null; score: number | null; note_max: number; resultat: string | null; feedback: string | null; statut: 'planifie' | 'realise' | 'annule' }
interface Financement { id: string; titre: string; type: FinancementType; montant_demande: number | null; montant_obtenu: number | null; statut: FinancementStatut; date_depot: string | null; date_reponse: string | null; notes: string | null }
interface Jalon { id: string; titre: string; description: string | null; echeance: string | null; statut: JalonStatut; ordre: number }

const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

const PITCH_STATUT_META = {
  planifie: { label: 'Planifié',  cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  realise:  { label: 'Réalisé',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  annule:   { label: 'Annulé',   cls: 'bg-slate-100 text-slate-400 border-slate-200' },
}

type ActiveSection = 'porteurs' | 'sessions' | 'pitchs' | 'financements' | 'jalons' | null

export default function ProjetDetailPage() {
  const { orgId, projetId } = useParams<{ orgId: string; projetId: string }>()
  const supabase = createClient()

  const [projet, setProjet] = useState<Projet | null>(null)
  const [porteurs, setPorteurs] = useState<Porteur[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [pitchs, setPitchs] = useState<Pitch[]>([])
  const [financements, setFinancements] = useState<Financement[]>([])
  const [jalons, setJalons] = useState<Jalon[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<ActiveSection>(null)
  const [saving, setSaving] = useState(false)

  // Forms
  const [porteurForm, setPorteurForm] = useState({ nom: '', email: '', role: 'Co-fondateur' })
  const [sessionForm, setSessionForm] = useState({ expert_nom: '', expert_titre: '', theme: 'business_model' as SessionTheme, date_session: '', duree_minutes: '', compte_rendu: '', actions_suivantes: '' })
  const [pitchForm, setPitchForm] = useState({ titre: '', type: 'interne' as PitchType, date_pitch: '', lieu: '', jury: '', note_max: '20' })
  const [financForm, setFinancForm] = useState({ titre: '', type: 'bourse' as FinancementType, montant_demande: '', montant_obtenu: '', statut: 'identifie' as FinancementStatut, date_depot: '', notes: '' })
  const [jalonForm, setJalonForm] = useState({ titre: '', description: '', echeance: '' })

  async function load() {
    setLoading(true)
    const [{ data: pr }, { data: po }, { data: se }, { data: pi }, { data: fi }, { data: ja }] = await Promise.all([
      supabase.from('incubateur_projets').select('*').eq('id', projetId).single(),
      supabase.from('incubateur_porteurs').select('*').eq('projet_id', projetId),
      supabase.from('incubateur_sessions').select('*').eq('projet_id', projetId).order('date_session', { ascending: false }),
      supabase.from('incubateur_pitchs').select('*').eq('projet_id', projetId).order('date_pitch', { ascending: false }),
      supabase.from('incubateur_financements').select('*').eq('projet_id', projetId),
      supabase.from('incubateur_jalons').select('*').eq('projet_id', projetId).order('ordre'),
    ])
    setProjet(pr); setPorteurs(po ?? []); setSessions(se ?? [])
    setPitchs(pi ?? []); setFinancements(fi ?? []); setJalons(ja ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [projetId])

  // Toggle score maturité
  async function toggleScore(field: keyof typeof SCORE_MATURITE_ITEMS[0] | string) {
    if (!projet) return
    const updated = { ...projet, [field]: !projet[field as keyof Projet] }
    const newScore = calculateScoreMaturite({
      business_model: updated.business_model,
      prototype: updated.prototype,
      premier_client: updated.premier_client,
      financement: updated.financement_obtenu,
      equipe_complete: updated.equipe_complete,
    })
    await supabase.from('incubateur_projets').update({ [field]: !projet[field as keyof Projet], score_maturite: newScore }).eq('id', projetId)
    setProjet({ ...updated, score_maturite: newScore } as Projet)
  }

  async function updateStade(stade: ProjetStade) {
    await supabase.from('incubateur_projets').update({ stade }).eq('id', projetId)
    setProjet(p => p ? { ...p, stade } : p)
  }

  // Sauvegarde porteur
  async function savePorteur() {
    if (!porteurForm.nom.trim()) return
    setSaving(true)
    await supabase.from('incubateur_porteurs').insert({ projet_id: projetId, ...porteurForm, email: porteurForm.email || null })
    setPorteurForm({ nom: '', email: '', role: 'Co-fondateur' })
    setSaving(false); load()
  }

  // Sauvegarde session
  async function saveSession() {
    if (!sessionForm.expert_nom.trim()) return
    setSaving(true)
    await supabase.from('incubateur_sessions').insert({ projet_id: projetId, organization_id: orgId, expert_nom: sessionForm.expert_nom, expert_titre: sessionForm.expert_titre || null, theme: sessionForm.theme, date_session: sessionForm.date_session || null, duree_minutes: sessionForm.duree_minutes ? parseInt(sessionForm.duree_minutes) : null, compte_rendu: sessionForm.compte_rendu || null, actions_suivantes: sessionForm.actions_suivantes || null })
    setSessionForm({ expert_nom: '', expert_titre: '', theme: 'business_model', date_session: '', duree_minutes: '', compte_rendu: '', actions_suivantes: '' })
    setSaving(false); load()
  }

  // Sauvegarde pitch
  async function savePitch() {
    if (!pitchForm.titre.trim()) return
    setSaving(true)
    await supabase.from('incubateur_pitchs').insert({ projet_id: projetId, organization_id: orgId, titre: pitchForm.titre, type: pitchForm.type, date_pitch: pitchForm.date_pitch || null, lieu: pitchForm.lieu || null, jury: pitchForm.jury || null, note_max: parseFloat(pitchForm.note_max) || 20, statut: 'planifie' })
    setPitchForm({ titre: '', type: 'interne', date_pitch: '', lieu: '', jury: '', note_max: '20' })
    setSaving(false); load()
  }

  // Sauvegarde financement
  async function saveFinancement() {
    if (!financForm.titre.trim()) return
    setSaving(true)
    await supabase.from('incubateur_financements').insert({ projet_id: projetId, organization_id: orgId, titre: financForm.titre, type: financForm.type, montant_demande: financForm.montant_demande ? parseFloat(financForm.montant_demande) : null, montant_obtenu: financForm.montant_obtenu ? parseFloat(financForm.montant_obtenu) : null, statut: financForm.statut, date_depot: financForm.date_depot || null, notes: financForm.notes || null })
    setFinancForm({ titre: '', type: 'bourse', montant_demande: '', montant_obtenu: '', statut: 'identifie', date_depot: '', notes: '' })
    setSaving(false); load()
  }

  // Sauvegarde jalon
  async function saveJalon() {
    if (!jalonForm.titre.trim()) return
    setSaving(true)
    await supabase.from('incubateur_jalons').insert({ projet_id: projetId, titre: jalonForm.titre, description: jalonForm.description || null, echeance: jalonForm.echeance || null, statut: 'a_faire', ordre: jalons.length })
    setJalonForm({ titre: '', description: '', echeance: '' })
    setSaving(false); load()
  }

  async function updateJalonStatut(id: string, statut: JalonStatut) {
    await supabase.from('incubateur_jalons').update({ statut }).eq('id', id)
    setJalons(prev => prev.map(j => j.id === id ? { ...j, statut } : j))
  }

  async function updatePitchStatut(id: string, statut: Pitch['statut']) {
    await supabase.from('incubateur_pitchs').update({ statut }).eq('id', id)
    setPitchs(prev => prev.map(p => p.id === id ? { ...p, statut } : p))
  }

  async function updateFinancStatut(id: string, statut: FinancementStatut) {
    await supabase.from('incubateur_financements').update({ statut }).eq('id', id)
    setFinancements(prev => prev.map(f => f.id === id ? { ...f, statut } : f))
  }

  if (loading || !projet) return <div className="p-8 text-center text-slate-400 text-sm">Chargement...</div>

  const stageMeta = PROJET_STADE_META[projet.stade]
  const stageIdx = STADE_PIPELINE.indexOf(projet.stade)
  const totalFinancement = financements.filter(f => f.statut === 'obtenu').reduce((acc, f) => acc + (f.montant_obtenu ?? 0), 0)
  const jalonsValides = jalons.filter(j => j.statut === 'valide').length
  const jalonsEnRetard = jalons.filter(j => j.echeance && new Date(j.echeance) < new Date() && j.statut !== 'valide').length

  const aiContext = {
    nom: projet.nom,
    secteur: projet.secteur,
    stade_label: stageMeta.label,
    stade_index: stageIdx + 1,
    score: projet.score_maturite,
    description: projet.description,
    business_model: projet.business_model,
    prototype: projet.prototype,
    premier_client: projet.premier_client,
    financement_obtenu: projet.financement_obtenu,
    equipe_complete: projet.equipe_complete,
    besoins: projet.besoins,
    jalons_en_retard: jalonsEnRetard,
    total_jalons: jalons.length,
    financement_total: totalFinancement,
  }

  const SectionHeader = ({ id, label, icon: Icon, count }: { id: ActiveSection; label: string; icon: any; count?: number }) => (
    <button onClick={() => setActiveSection(activeSection === id ? null : id)}
      className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-[#1B3A6B]" />
        <span className="font-semibold text-slate-800 text-sm">{label}</span>
        {count !== undefined && count > 0 && (
          <span className="text-xs bg-[#1B3A6B]/10 text-[#1B3A6B] px-2 py-0.5 rounded-full font-medium">{count}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#1B3A6B] font-medium">+ Ajouter</span>
        <ChevronDown size={14} className={`text-slate-300 transition-transform ${activeSection === id ? 'rotate-180' : ''}`} />
      </div>
    </button>
  )

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/org/${orgId}/incubateur/projets`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#1B3A6B] mb-3 transition-colors">
          <ArrowLeft size={13} /> Projets
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1B3A6B]/8 flex items-center justify-center text-2xl shrink-0">
              {stageMeta.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{projet.nom}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {projet.secteur && <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{projet.secteur}</span>}
                <span className="text-xs text-slate-400">Entré le {new Date(projet.date_entree).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>
          <span className={`text-sm px-3 py-1.5 rounded-lg border font-semibold shrink-0 ${stageMeta.cls}`}>
            {stageMeta.icon} {stageMeta.label}
          </span>
        </div>
      </div>

      {/* Layout 2 colonnes — Fiche + Assistant IA */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">
      <div> {/* Colonne gauche */}

      {/* Score maturité */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800 text-sm">Score de maturité</h2>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-2 rounded-full transition-all ${projet.score_maturite < 40 ? 'bg-slate-400' : projet.score_maturite < 70 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                style={{ width: `${projet.score_maturite}%` }} />
            </div>
            <span className="text-lg font-bold text-slate-800">{projet.score_maturite}<span className="text-sm font-normal text-slate-400">/100</span></span>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[
            { field: 'business_model', label: 'Business Model', val: projet.business_model },
            { field: 'prototype',      label: 'Prototype',       val: projet.prototype },
            { field: 'premier_client', label: '1er client',      val: projet.premier_client },
            { field: 'financement_obtenu', label: 'Financement', val: projet.financement_obtenu },
            { field: 'equipe_complete', label: 'Équipe',         val: projet.equipe_complete },
          ].map(item => (
            <button key={item.field} onClick={() => toggleScore(item.field)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${item.val ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
              {item.val ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} className="text-slate-300" />}
              <span className={`text-xs font-medium leading-tight ${item.val ? 'text-emerald-700' : 'text-slate-500'}`}>{item.label}</span>
              <span className={`text-xs font-bold ${item.val ? 'text-emerald-600' : 'text-slate-300'}`}>+20</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline stade */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
        <h2 className="font-semibold text-slate-800 text-sm mb-3">Stade du projet</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {STADE_PIPELINE.map((s, i) => {
            const meta = PROJET_STADE_META[s]
            const isActive = projet.stade === s
            const isPassed = STADE_PIPELINE.indexOf(projet.stade) > i
            return (
              <button key={s} onClick={() => updateStade(s)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${isActive ? meta.cls + ' ring-2 ring-offset-1 ring-[#1B3A6B]' : isPassed ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                {meta.icon} {meta.label}
              </button>
            )
          })}
          <button onClick={() => updateStade('abandonne')}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${projet.stade === 'abandonne' ? PROJET_STADE_META.abandonne.cls : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}>
            🚫 Abandonner
          </button>
        </div>
      </div>

      {/* Sections collapsibles */}
      <div className="space-y-3">

        {/* PORTEURS */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <SectionHeader id="porteurs" label="Équipe fondatrice" icon={Users} count={porteurs.length} />
          {activeSection === 'porteurs' && (
            <div className="px-5 pb-5 border-t border-slate-100 pt-4">
              {porteurs.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {porteurs.map(p => (
                    <div key={p.id} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="w-7 h-7 rounded-full bg-[#1B3A6B]/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-[#1B3A6B]">{p.nom.charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{p.nom}</p>
                        <p className="text-xs text-slate-400">{p.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="col-span-1"><label className={labelCls}>Nom *</label><input className={inputCls} value={porteurForm.nom} onChange={e => setPorteurForm(f => ({ ...f, nom: e.target.value }))} /></div>
                <div><label className={labelCls}>Email</label><input type="email" className={inputCls} value={porteurForm.email} onChange={e => setPorteurForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div><label className={labelCls}>Rôle</label>
                  <select className={inputCls} value={porteurForm.role} onChange={e => setPorteurForm(f => ({ ...f, role: e.target.value }))}>
                    {PORTEUR_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={savePorteur} disabled={saving || !porteurForm.nom.trim()}
                className="px-3 py-1.5 bg-[#1B3A6B] text-white text-xs rounded-lg hover:bg-[#2E5BA8] disabled:opacity-50 transition-colors">
                + Ajouter
              </button>
            </div>
          )}
        </div>

        {/* SESSIONS */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <SectionHeader id="sessions" label="Sessions d'accompagnement" icon={MessageSquare} count={sessions.length} />
          {activeSection === 'sessions' && (
            <div className="px-5 pb-5 border-t border-slate-100 pt-4">
              {sessions.length > 0 && (
                <div className="space-y-2 mb-4">
                  {sessions.map(s => {
                    const themeMeta = SESSION_THEME_META[s.theme]
                    return (
                      <div key={s.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-lg shrink-0">{themeMeta.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800">{s.expert_nom} <span className="text-slate-400 font-normal">{s.expert_titre ? `— ${s.expert_titre}` : ''}</span></p>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{themeMeta.label}</span>
                            {s.date_session && <span>{new Date(s.date_session).toLocaleDateString('fr-FR')}</span>}
                            {s.duree_minutes && <span>{s.duree_minutes} min</span>}
                          </div>
                          {s.actions_suivantes && <p className="text-xs text-[#1B3A6B] mt-1">→ {s.actions_suivantes}</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div><label className={labelCls}>Expert/Coach *</label><input className={inputCls} value={sessionForm.expert_nom} onChange={e => setSessionForm(f => ({ ...f, expert_nom: e.target.value }))} /></div>
                <div><label className={labelCls}>Titre</label><input className={inputCls} value={sessionForm.expert_titre} onChange={e => setSessionForm(f => ({ ...f, expert_titre: e.target.value }))} /></div>
                <div><label className={labelCls}>Thème</label>
                  <select className={inputCls} value={sessionForm.theme} onChange={e => setSessionForm(f => ({ ...f, theme: e.target.value as SessionTheme }))}>
                    {(Object.entries(SESSION_THEME_META) as [SessionTheme, typeof SESSION_THEME_META[SessionTheme]][]).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className={labelCls}>Date</label><input type="date" className={inputCls} value={sessionForm.date_session} onChange={e => setSessionForm(f => ({ ...f, date_session: e.target.value }))} /></div>
                <div><label className={labelCls}>Durée (min)</label><input type="number" className={inputCls} value={sessionForm.duree_minutes} onChange={e => setSessionForm(f => ({ ...f, duree_minutes: e.target.value }))} /></div>
              </div>
              <div className="mb-3"><label className={labelCls}>Actions suivantes</label><input className={inputCls} value={sessionForm.actions_suivantes} onChange={e => setSessionForm(f => ({ ...f, actions_suivantes: e.target.value }))} /></div>
              <button onClick={saveSession} disabled={saving || !sessionForm.expert_nom.trim()}
                className="px-3 py-1.5 bg-[#1B3A6B] text-white text-xs rounded-lg hover:bg-[#2E5BA8] disabled:opacity-50 transition-colors">
                + Ajouter la session
              </button>
            </div>
          )}
        </div>

        {/* PITCHS */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <SectionHeader id="pitchs" label="Pitchs" icon={Trophy} count={pitchs.length} />
          {activeSection === 'pitchs' && (
            <div className="px-5 pb-5 border-t border-slate-100 pt-4">
              {pitchs.length > 0 && (
                <div className="space-y-2 mb-4">
                  {pitchs.map(p => {
                    const typeMeta = PITCH_TYPE_META[p.type]
                    const statMeta = PITCH_STATUT_META[p.statut]
                    return (
                      <div key={p.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-lg shrink-0">{typeMeta.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800">{p.titre}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span className={`px-1.5 py-0.5 rounded border ${typeMeta.cls} font-medium`}>{typeMeta.label}</span>
                            {p.date_pitch && <span>{new Date(p.date_pitch).toLocaleDateString('fr-FR')}</span>}
                            {p.score && <span className="font-bold text-slate-700">{p.score}/{p.note_max}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {(['planifie', 'realise', 'annule'] as const).map(s => (
                            <button key={s} onClick={() => updatePitchStatut(p.id, s)}
                              className={`text-xs px-2 py-1 rounded-lg border font-medium transition-all ${p.statut === s ? PITCH_STATUT_META[s].cls : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}`}>
                              {PITCH_STATUT_META[s].label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="col-span-2"><label className={labelCls}>Titre *</label><input className={inputCls} value={pitchForm.titre} onChange={e => setPitchForm(f => ({ ...f, titre: e.target.value }))} /></div>
                <div><label className={labelCls}>Type</label>
                  <select className={inputCls} value={pitchForm.type} onChange={e => setPitchForm(f => ({ ...f, type: e.target.value as PitchType }))}>
                    {(Object.entries(PITCH_TYPE_META) as [PitchType, typeof PITCH_TYPE_META[PitchType]][]).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div><label className={labelCls}>Date</label><input type="date" className={inputCls} value={pitchForm.date_pitch} onChange={e => setPitchForm(f => ({ ...f, date_pitch: e.target.value }))} /></div>
                <div><label className={labelCls}>Jury</label><input className={inputCls} value={pitchForm.jury} onChange={e => setPitchForm(f => ({ ...f, jury: e.target.value }))} /></div>
                <div><label className={labelCls}>Note max</label><input type="number" className={inputCls} value={pitchForm.note_max} onChange={e => setPitchForm(f => ({ ...f, note_max: e.target.value }))} /></div>
              </div>
              <button onClick={savePitch} disabled={saving || !pitchForm.titre.trim()}
                className="px-3 py-1.5 bg-[#1B3A6B] text-white text-xs rounded-lg hover:bg-[#2E5BA8] disabled:opacity-50 transition-colors">
                + Planifier le pitch
              </button>
            </div>
          )}
        </div>

        {/* FINANCEMENTS */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div onClick={() => setActiveSection(activeSection === 'financements' ? null : 'financements')}
            className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-[#1B3A6B]" />
              <span className="font-semibold text-slate-800 text-sm">Financements</span>
              {financements.length > 0 && <span className="text-xs bg-[#1B3A6B]/10 text-[#1B3A6B] px-2 py-0.5 rounded-full font-medium">{financements.length}</span>}
              {totalFinancement > 0 && <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">{totalFinancement.toLocaleString('fr-FR')} MAD levés</span>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#1B3A6B] font-medium">+ Ajouter</span>
              <ChevronDown size={14} className={`text-slate-300 transition-transform ${activeSection === 'financements' ? 'rotate-180' : ''}`} />
            </div>
          </div>
          {activeSection === 'financements' && (
            <div className="px-5 pb-5 border-t border-slate-100 pt-4">
              {financements.length > 0 && (
                <div className="space-y-2 mb-4">
                  {financements.map(f => {
                    const typeMeta = FINANCEMENT_TYPE_META[f.type]
                    const statMeta = FINANCEMENT_STATUT_META[f.statut]
                    return (
                      <div key={f.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-lg shrink-0">{typeMeta.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800">{f.titre}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>{typeMeta.label}</span>
                            {f.montant_demande && <span>Demandé : {f.montant_demande.toLocaleString('fr-FR')} MAD</span>}
                            {f.montant_obtenu && <span className="text-emerald-600 font-medium">Obtenu : {f.montant_obtenu.toLocaleString('fr-FR')} MAD</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {(['identifie', 'candidate', 'obtenu', 'refuse'] as FinancementStatut[]).map(s => (
                            <button key={s} onClick={() => updateFinancStatut(f.id, s)}
                              className={`text-xs px-2 py-1 rounded-lg border font-medium transition-all ${f.statut === s ? FINANCEMENT_STATUT_META[s].cls : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}`}>
                              {FINANCEMENT_STATUT_META[s].label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="col-span-2"><label className={labelCls}>Source / Titre *</label><input className={inputCls} placeholder="ex: Prix Maroc Innov, Bourse CRI..." value={financForm.titre} onChange={e => setFinancForm(f => ({ ...f, titre: e.target.value }))} /></div>
                <div><label className={labelCls}>Type</label>
                  <select className={inputCls} value={financForm.type} onChange={e => setFinancForm(f => ({ ...f, type: e.target.value as FinancementType }))}>
                    {(Object.entries(FINANCEMENT_TYPE_META) as [FinancementType, typeof FINANCEMENT_TYPE_META[FinancementType]][]).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div><label className={labelCls}>Montant demandé (MAD)</label><input type="number" className={inputCls} value={financForm.montant_demande} onChange={e => setFinancForm(f => ({ ...f, montant_demande: e.target.value }))} /></div>
                <div><label className={labelCls}>Montant obtenu (MAD)</label><input type="number" className={inputCls} value={financForm.montant_obtenu} onChange={e => setFinancForm(f => ({ ...f, montant_obtenu: e.target.value }))} /></div>
                <div><label className={labelCls}>Statut</label>
                  <select className={inputCls} value={financForm.statut} onChange={e => setFinancForm(f => ({ ...f, statut: e.target.value as FinancementStatut }))}>
                    {(Object.entries(FINANCEMENT_STATUT_META) as [FinancementStatut, typeof FINANCEMENT_STATUT_META[FinancementStatut]][]).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={saveFinancement} disabled={saving || !financForm.titre.trim()}
                className="px-3 py-1.5 bg-[#1B3A6B] text-white text-xs rounded-lg hover:bg-[#2E5BA8] disabled:opacity-50 transition-colors">
                + Ajouter le financement
              </button>
            </div>
          )}
        </div>

        {/* JALONS */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div onClick={() => setActiveSection(activeSection === 'jalons' ? null : 'jalons')}
            className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2">
              <Flag size={16} className="text-[#1B3A6B]" />
              <span className="font-semibold text-slate-800 text-sm">Jalons & Roadmap</span>
              {jalons.length > 0 && (
                <>
                  <span className="text-xs bg-[#1B3A6B]/10 text-[#1B3A6B] px-2 py-0.5 rounded-full font-medium">{jalons.length}</span>
                  <span className="text-xs text-emerald-600 font-medium">{jalonsValides}/{jalons.length} validés</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#1B3A6B] font-medium">+ Ajouter</span>
              <ChevronDown size={14} className={`text-slate-300 transition-transform ${activeSection === 'jalons' ? 'rotate-180' : ''}`} />
            </div>
          </div>
          {activeSection === 'jalons' && (
            <div className="px-5 pb-5 border-t border-slate-100 pt-4">
              {jalons.length > 0 && (
                <div className="space-y-2 mb-4">
                  {/* Progress */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-2 bg-emerald-400 rounded-full transition-all" style={{ width: `${jalons.length > 0 ? (jalonsValides / jalons.length) * 100 : 0}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-600">{jalons.length > 0 ? Math.round((jalonsValides / jalons.length) * 100) : 0}%</span>
                  </div>
                  {jalons.map(j => {
                    const statMeta = JALON_STATUT_META[j.statut]
                    const isLate = j.echeance && new Date(j.echeance) < new Date() && j.statut !== 'valide'
                    return (
                      <div key={j.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-base shrink-0">{statMeta.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">{j.titre}</p>
                          {j.echeance && <p className={`text-xs mt-0.5 ${isLate ? 'text-red-500 font-medium' : 'text-slate-400'}`}>📅 {new Date(j.echeance).toLocaleDateString('fr-FR')}{isLate ? ' — En retard' : ''}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {(['a_faire', 'en_cours', 'valide'] as JalonStatut[]).map(s => (
                            <button key={s} onClick={() => updateJalonStatut(j.id, s)}
                              className={`text-xs px-2 py-1 rounded-lg border font-medium transition-all ${j.statut === s ? JALON_STATUT_META[s].cls : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}>
                              {JALON_STATUT_META[s].label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="col-span-2"><label className={labelCls}>Jalon *</label><input className={inputCls} placeholder="ex: Business plan finalisé, 10 bêta-testeurs..." value={jalonForm.titre} onChange={e => setJalonForm(f => ({ ...f, titre: e.target.value }))} /></div>
                <div><label className={labelCls}>Échéance</label><input type="date" className={inputCls} value={jalonForm.echeance} onChange={e => setJalonForm(f => ({ ...f, echeance: e.target.value }))} /></div>
              </div>
              <button onClick={saveJalon} disabled={saving || !jalonForm.titre.trim()}
                className="px-3 py-1.5 bg-[#1B3A6B] text-white text-xs rounded-lg hover:bg-[#2E5BA8] disabled:opacity-50 transition-colors">
                + Ajouter le jalon
              </button>
            </div>
          )}
        </div>

      </div>
      </div> {/* Fin colonne gauche */}

      {/* Colonne droite — Assistant IA */}
      <div className="lg:sticky lg:top-6 h-[600px] lg:h-[calc(100vh-6rem)] flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <AIAssistant context={aiContext} />
      </div>

      </div> {/* Fin grid */}
    </div>
  )
}
