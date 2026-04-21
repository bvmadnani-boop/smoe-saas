'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getScoreLevel } from '@/lib/risk-templates'
import {
  CheckCircle2, AlertTriangle, ShieldAlert, TrendingUp,
  FileText, Check, ChevronDown, ChevronUp, ClipboardCheck,
  Users, BookOpen, BarChart3,
} from 'lucide-react'

interface ReviewData {
  ncs:               any[]
  activePolicy:      any | null
  risks:             any[]
  audits:            any[]
  swot:              any[]
  pestel:            any[]
  parties:           any[]
  totalTeachers:     number
  validatedTeachers: number
  sup2iPct:          number
  nonValidatedCount: number
  previousReview:    any | null
  generatedAt:       string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function SectionCard({
  num, title, icon: Icon, iconCls, children, defaultOpen = true,
}: {
  num: string; title: string; icon?: any; iconCls?: string
  children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
      >
        <span className="w-7 h-7 rounded-full bg-[#1B3A6B] text-white text-xs font-bold
                         flex items-center justify-center shrink-0">
          {num}
        </span>
        {Icon && (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconCls}`}>
            <Icon size={14} />
          </div>
        )}
        <span className="flex-1 font-semibold text-slate-800 text-sm">{title}</span>
        {open ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-slate-50">{children}</div>}
    </div>
  )
}

function Badge({ children, cls }: { children: React.ReactNode; cls: string }) {
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>{children}</span>
}

function DataRow({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`flex items-start justify-between py-2 border-b border-slate-50 last:border-0 ${highlight ? 'bg-amber-50 -mx-5 px-5 rounded' : ''}`}>
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800 text-right max-w-[60%]">{value}</span>
    </div>
  )
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function ManagementReviewDoc({
  orgId,
  mode,
  data,
  review,
}: {
  orgId: string
  mode: 'new' | 'edit'
  data: ReviewData
  review?: any
}) {
  const router   = useRouter()
  const supabase = createClient()

  const year = new Date().getFullYear()
  const [title,       setTitle]       = useState(review?.title      ?? `Revue de direction — ${year}`)
  const [reviewDate,  setReviewDate]  = useState(review?.review_date ?? '')
  const [attendees,   setAttendees]   = useState(review?.attendees   ?? '')
  const [decisions,   setDecisions]   = useState(review?.decisions   ?? '')
  const [loading,     setLoading]     = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [error,       setError]       = useState('')

  // ── Données calculées ──────────────────────────────────────────────────────
  const ncOuvertes  = data.ncs.filter(n => n.status === 'ouverte')
  const ncEnCours   = data.ncs.filter(n => n.status === 'en_cours')
  const ncCloturees = data.ncs.filter(n => n.status === 'cloturee')
  const ncMajeures  = data.ncs.filter(n => n.severity === 'majeure' && n.status !== 'cloturee')
  const ncOverdue   = data.ncs.filter(n =>
    n.ocap_deadline && new Date(n.ocap_deadline) < new Date()
    && n.status !== 'cloturee'
  )

  const risquesCritiques = data.risks.filter(r => r.score >= 20 && r.type === 'risque')
  const risquesEleves    = data.risks.filter(r => r.score >= 12 && r.score < 20 && r.type === 'risque')
  const opportunites     = data.risks.filter(r => r.type === 'opportunite')
  const risquesClos      = data.risks.filter(r => r.status === 'clos')

  const auditsRealises  = data.audits.filter(a => a.status === 'realise')
  const auditsPlanifies = data.audits.filter(a => a.status === 'planifie')
  const auditsEnCours   = data.audits.filter(a => a.status === 'en_cours')
  const pctAudits = data.audits.length > 0
    ? Math.round((auditsRealises.length / data.audits.length) * 100) : 0

  const forcesCount     = data.swot.filter(s => s.quadrant === 'forces'   && s.is_active).length
  const faiblessesCount = data.swot.filter(s => s.quadrant === 'faiblesses' && s.is_active).length
  const oppCtx          = data.swot.filter(s => s.quadrant === 'opportunites' && s.is_active).length
  const menacesCount    = data.swot.filter(s => s.quadrant === 'menaces'  && s.is_active).length

  const policyOverdue = data.activePolicy?.review_date
    && new Date(data.activePolicy.review_date) < new Date()

  // ── Sauvegarde ──────────────────────────────────────────────────────────────
  async function save(status: 'planifie' | 'realise') {
    setLoading(true); setError('')
    const payload = {
      organization_id: orgId,
      title:           title.trim() || `Revue de direction — ${year}`,
      review_date:     reviewDate || null,
      attendees:       attendees.trim() || null,
      decisions:       decisions.trim() || null,
      status,
      generated_data:  data,
    }

    if (mode === 'new') {
      const { data: row, error: err } = await supabase
        .from('management_reviews')
        .insert({ ...payload, version: 1 }).select().single()
      if (err) { setError(err.message); setLoading(false); return }
      router.push(`/org/${orgId}/qualite/revue/${row.id}`)
      router.refresh()
    } else {
      const { error: err } = await supabase
        .from('management_reviews')
        .update({ ...payload, version: (review?.version ?? 1) + 1 })
        .eq('id', review.id)
      if (err) { setError(err.message); setLoading(false); return }
      setSaved(true); setLoading(false); router.refresh()
      setTimeout(() => setSaved(false), 2500)
    }
  }

  const inputCls = `w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`

  return (
    <div className="space-y-4">

      {/* En-tête revue */}
      <div className="bg-[#1B3A6B] rounded-xl p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-blue-200 text-xs font-medium uppercase tracking-wide mb-1">
              ISO 21001 §9.3 — Revue de direction
            </p>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="text-xl font-bold bg-transparent border-b border-white/30
                         focus:border-white focus:outline-none w-full text-white placeholder-blue-300"
            />
          </div>
          <div className="text-right shrink-0">
            <p className="text-blue-300 text-xs">Générée le</p>
            <p className="text-white text-sm font-medium">
              {new Date(data.generatedAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label className="text-blue-200 text-xs block mb-1">Date de la revue</label>
            <input type="date" value={reviewDate} onChange={e => setReviewDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg
                         text-white text-sm focus:outline-none focus:border-white" />
          </div>
          <div>
            <label className="text-blue-200 text-xs block mb-1">Participants</label>
            <input type="text" value={attendees} onChange={e => setAttendees(e.target.value)}
              placeholder="DG, Dir. pédagogique, RAF, Qualité..."
              className="w-full px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg
                         text-white text-sm focus:outline-none focus:border-white placeholder-blue-400" />
          </div>
        </div>
      </div>

      {/* ── §1 : Suivi revue précédente ─────────────────────────────────── */}
      <SectionCard num="1" title="Suivi de la revue précédente" icon={BookOpen} iconCls="bg-slate-100 text-slate-500">
        <div className="mt-3">
          {data.previousReview ? (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm font-medium text-slate-700">
                Dernière revue réalisée : <strong>{data.previousReview.title}</strong>
              </p>
              {data.previousReview.review_date && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {new Date(data.previousReview.review_date).toLocaleDateString('fr-FR')}
                </p>
              )}
              <p className="text-xs text-slate-400 mt-2 italic">
                → Vérifier l'avancement des décisions et actions de cette revue.
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700">Première revue de direction — aucun historique disponible.</p>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── §2 : Contexte ───────────────────────────────────────────────── */}
      <SectionCard num="2" title="Contexte de l'organisme (§4)" icon={BarChart3} iconCls="bg-blue-100 text-blue-600">
        <div className="mt-3 space-y-3">
          {/* SWOT */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Forces',       count: forcesCount,     cls: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
              { label: 'Faiblesses',   count: faiblessesCount, cls: 'bg-red-50 border-red-200 text-red-700' },
              { label: 'Opportunités', count: oppCtx,          cls: 'bg-blue-50 border-blue-200 text-blue-700' },
              { label: 'Menaces',      count: menacesCount,    cls: 'bg-amber-50 border-amber-200 text-amber-700' },
            ].map(({ label, count, cls }) => (
              <div key={label} className={`rounded-lg border p-3 text-center ${cls}`}>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs font-medium">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400">
            {data.parties.filter(p => p.is_active).length} parties intéressées actives ·
            {' '}{data.pestel.filter(p => p.is_active).length} facteurs PESTEL identifiés
          </p>
        </div>
      </SectionCard>

      {/* ── §3 : Politique qualité ──────────────────────────────────────── */}
      <SectionCard num="3" title="Politique & Objectifs qualité (§5.2)" icon={FileText} iconCls="bg-violet-100 text-violet-600">
        <div className="mt-3">
          {data.activePolicy ? (
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{data.activePolicy.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Version {data.activePolicy.version} ·
                    Approuvée par {data.activePolicy.approver_name ?? 'N/A'} ·
                    {data.activePolicy.approved_at && ` le ${new Date(data.activePolicy.approved_at).toLocaleDateString('fr-FR')}`}
                  </p>
                </div>
              </div>
              {policyOverdue && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-700">
                    <strong>Révision en retard</strong> — prévue le {new Date(data.activePolicy.review_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
              {!policyOverdue && data.activePolicy.review_date && (
                <p className="text-xs text-slate-400 px-1">
                  Prochaine révision : {new Date(data.activePolicy.review_date).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle size={14} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700 font-medium">⚠️ Aucune politique qualité active — action requise avant la revue.</p>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── §4 : Non-conformités ────────────────────────────────────────── */}
      <SectionCard num="4" title="Non-conformités & Actions correctives (§10)" icon={AlertTriangle} iconCls="bg-red-100 text-red-600">
        <div className="mt-3 space-y-3">
          {/* KPIs NC */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Ouvertes',   value: ncOuvertes.length,  cls: 'text-red-600    bg-red-50    border-red-200' },
              { label: 'En cours',   value: ncEnCours.length,   cls: 'text-amber-600  bg-amber-50  border-amber-200' },
              { label: 'Clôturées', value: ncCloturees.length,  cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
              { label: 'Majeures',  value: ncMajeures.length,   cls: 'text-red-700    bg-red-100   border-red-300' },
            ].map(({ label, value, cls }) => (
              <div key={label} className={`rounded-lg border p-3 text-center ${cls}`}>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs font-medium">{label}</p>
              </div>
            ))}
          </div>

          {/* NC majeures détail */}
          {ncMajeures.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
              <p className="text-xs font-bold text-red-700 mb-2">
                NC majeures non clôturées ({ncMajeures.length}) — Action prioritaire requise :
              </p>
              {ncMajeures.map(nc => (
                <div key={nc.id} className="flex items-start gap-2 text-xs text-red-700">
                  <span className="shrink-0">•</span>
                  <span>{nc.title}</span>
                </div>
              ))}
            </div>
          )}

          {/* NC en retard */}
          {ncOverdue.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs font-bold text-amber-700">
                ⚠️ {ncOverdue.length} NC avec délai OCAP dépassé
              </p>
            </div>
          )}

          {ncOuvertes.length === 0 && ncEnCours.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 size={14} />
              Aucune non-conformité ouverte à la date de la revue ✓
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── §5 : Risques & Opportunités ─────────────────────────────────── */}
      <SectionCard num="5" title="Risques & Opportunités (§6)" icon={ShieldAlert} iconCls="bg-orange-100 text-orange-600">
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Critiques (≥20)',  value: risquesCritiques.length, cls: 'text-red-700    bg-red-100   border-red-300' },
              { label: 'Élevés (12-19)',   value: risquesEleves.length,    cls: 'text-orange-700 bg-orange-100 border-orange-300' },
              { label: 'Opportunités',     value: opportunites.length,     cls: 'text-emerald-700 bg-emerald-100 border-emerald-300' },
              { label: 'Risques clos',     value: risquesClos.length,      cls: 'text-slate-600  bg-slate-100  border-slate-300' },
            ].map(({ label, value, cls }) => (
              <div key={label} className={`rounded-lg border p-3 text-center ${cls}`}>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs font-medium">{label}</p>
              </div>
            ))}
          </div>

          {risquesCritiques.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-red-700">Risques critiques (score ≥ 20) :</p>
              {risquesCritiques.map(r => {
                const meta = getScoreLevel(r.score)
                return (
                  <div key={r.id} className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${meta.cls}`}>
                      {r.score}
                    </span>
                    <span className="text-sm text-slate-700">{r.title}</span>
                    {r.treatment && <span className="text-xs text-slate-400">· {r.treatment}</span>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── §6 : Audits internes ────────────────────────────────────────── */}
      <SectionCard num="6" title="Résultats des audits internes (§9.2)" icon={ClipboardCheck} iconCls="bg-cyan-100 text-cyan-600">
        <div className="mt-3 space-y-3">
          {data.audits.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Aucun audit planifié pour cette période.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Réalisés',  value: auditsRealises.length,  cls: 'text-emerald-700 bg-emerald-100 border-emerald-300' },
                  { label: 'En cours',  value: auditsEnCours.length,   cls: 'text-amber-700   bg-amber-100   border-amber-300' },
                  { label: 'Planifiés', value: auditsPlanifies.length, cls: 'text-slate-600   bg-slate-100   border-slate-300' },
                ].map(({ label, value, cls }) => (
                  <div key={label} className={`rounded-lg border p-3 text-center ${cls}`}>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs font-medium">{label}</p>
                  </div>
                ))}
              </div>
              {/* Barre progression */}
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Avancement programme d'audit</span>
                  <span className="font-bold">{pctAudits}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pctAudits}%` }} />
                </div>
              </div>
            </>
          )}
        </div>
      </SectionCard>

      {/* ── §7 : Conformité SUP2I ────────────────────────────────────────── */}
      <SectionCard num="7" title="Conformité SUP2I — Ressources humaines" icon={Users} iconCls="bg-indigo-100 text-indigo-600">
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Total enseignants',  value: data.totalTeachers,     cls: 'text-slate-600   bg-slate-50    border-slate-200' },
              { label: 'Validés SUP2I',      value: data.validatedTeachers, cls: 'text-emerald-700 bg-emerald-100 border-emerald-300' },
              { label: 'Taux conformité',    value: `${data.sup2iPct}%`,    cls: data.sup2iPct === 100 ? 'text-emerald-700 bg-emerald-100 border-emerald-300' : 'text-amber-700 bg-amber-100 border-amber-300' },
            ].map(({ label, value, cls }) => (
              <div key={label} className={`rounded-lg border p-3 text-center ${cls}`}>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs font-medium">{label}</p>
              </div>
            ))}
          </div>
          {data.nonValidatedCount > 0 && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle size={14} className="text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700">
                <strong>{data.nonValidatedCount} enseignant{data.nonValidatedCount > 1 ? 's' : ''} non validé{data.nonValidatedCount > 1 ? 's' : ''}</strong>
                {' '}présent{data.nonValidatedCount > 1 ? 's' : ''} dans l'emploi du temps actuel
              </p>
            </div>
          )}
          {data.nonValidatedCount === 0 && data.totalTeachers > 0 && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 size={14} />
              Tous les enseignants actifs sont validés SUP2I ✓
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── §8 : Opportunités d'amélioration ────────────────────────────── */}
      <SectionCard num="8" title="Opportunités d'amélioration identifiées" icon={TrendingUp} iconCls="bg-teal-100 text-teal-600">
        <div className="mt-3 space-y-2">
          {opportunites.slice(0, 5).map(o => (
            <div key={o.id} className="flex items-start gap-2 text-sm text-slate-700 py-1.5 border-b border-slate-50 last:border-0">
              <span className="text-emerald-500 shrink-0 mt-0.5">✨</span>
              <span>{o.title}</span>
            </div>
          ))}
          {opportunites.length === 0 && (
            <p className="text-sm text-slate-400 italic">
              Aucune opportunité enregistrée dans le registre des risques.
            </p>
          )}
        </div>
      </SectionCard>

      {/* ── §9 : Décisions & Plan d'action ──────────────────────────────── */}
      <div className="bg-white rounded-xl border-2 border-[#1B3A6B]/20 overflow-hidden">
        <div className="px-5 py-4 bg-[#1B3A6B]/5 border-b border-[#1B3A6B]/10">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-[#1B3A6B] text-white text-xs font-bold
                             flex items-center justify-center shrink-0">9</span>
            <div>
              <p className="font-bold text-[#1B3A6B] text-sm">Décisions & Plan d'action de la direction</p>
              <p className="text-xs text-slate-500">Seule section à saisir manuellement — suite aux constats de la revue</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <textarea
            value={decisions}
            onChange={e => setDecisions(e.target.value)}
            rows={8}
            placeholder={`Action 1 — Responsable : [NOM] — Échéance : [DATE]\nEx: Lancer le programme de formation SUP2I pour 3 enseignants non validés\n\nAction 2 — Responsable : [NOM] — Échéance : [DATE]\nEx: Réviser la politique qualité avant le 30/06/${year}\n\nAction 3 — Responsable : [NOM] — Échéance : [DATE]\n...`}
            className={`w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent
              resize-y leading-relaxed`}
          />
          <p className="text-xs text-slate-400 mt-1">
            Ces décisions seront le "suivi revue précédente" de la prochaine revue.
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => save('planifie')} disabled={loading}
          className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium
                     hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center gap-2">
          <FileText size={15} />
          {loading ? 'Enregistrement...' : 'Enregistrer brouillon'}
        </button>
        <button onClick={() => save('realise')} disabled={loading}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium
                     hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2">
          <Check size={15} />
          Valider la revue
        </button>
        {saved && (
          <span className="text-sm text-emerald-600 font-medium">✓ Sauvegardé</span>
        )}
        <a href={`/org/${orgId}/qualite/revue`}
          className="ml-auto px-5 py-2.5 bg-white border border-slate-200 text-slate-600
                     rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
          Annuler
        </a>
      </div>
    </div>
  )
}
