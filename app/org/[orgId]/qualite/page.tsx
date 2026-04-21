import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  AlertTriangle, CheckCircle2, ClipboardList,
  ClipboardCheck, BookOpen, ChevronRight, Plus,
  MessageSquare, Star, TrendingUp,
} from 'lucide-react'
import { NC_CATEGORY_META, NC_SEVERITY_META, type NcCategory } from '@/lib/nc-ocap-templates'

export const dynamic = 'force-dynamic'

export default async function AmeliorationPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  const [
    { data: ncs },
    { data: teachersNoSup2i },
    { data: schedulesAll },
    { data: audits },
    { data: reviews },
    { data: reclamations },
    { data: enquetes },
    { data: ameliorations },
  ] = await Promise.all([
    supabase.from('nonconformities').select('id, title, category, severity, status, detected_at, ocap_deadline, version')
      .eq('organization_id', orgId).order('created_at', { ascending: false }),
    supabase.from('teachers').select('id, full_name, sup2i_validated')
      .eq('organization_id', orgId).eq('sup2i_validated', false),
    supabase.from('schedules').select('id, teacher_id, teachers(id, full_name, sup2i_validated)')
      .eq('organization_id', orgId),
    supabase.from('audit_plans').select('id, status').eq('organization_id', orgId),
    supabase.from('management_reviews').select('id, title, status, review_date')
      .eq('organization_id', orgId).order('review_date', { ascending: false }).limit(1),
    supabase.from('reclamations').select('id, gravite, statut').eq('organization_id', orgId),
    supabase.from('enquetes').select('id, statut, score_moyen').eq('organization_id', orgId),
    supabase.from('ameliorations').select('id, statut, priorite').eq('organization_id', orgId),
  ])

  const nonValidatedInSchedule = schedulesAll?.filter(s => {
    const t = s.teachers as any
    return t && t.sup2i_validated === false
  }) ?? []

  const counts = {
    total:    ncs?.length ?? 0,
    ouverte:  ncs?.filter(n => n.status === 'ouverte').length  ?? 0,
    en_cours: ncs?.filter(n => n.status === 'en_cours').length ?? 0,
    cloturee: ncs?.filter(n => n.status === 'cloturee').length ?? 0,
    majeures: ncs?.filter(n => n.severity === 'majeure' && n.status !== 'cloturee').length ?? 0,
  }

  const recentNcs  = ncs?.slice(0, 5) ?? []
  const openNcs    = ncs?.filter(n => n.status !== 'cloturee' && n.status !== 'rejetee') ?? []
  const overdueNcs = openNcs.filter(n =>
    n.ocap_deadline && new Date(n.ocap_deadline) < new Date()
  )

  const auditsRealises  = audits?.filter(a => a.status === 'realise').length ?? 0
  const auditsPlanifies = audits?.filter(a => a.status !== 'realise' && a.status !== 'annule').length ?? 0
  const lastReview      = reviews?.[0] ?? null

  const teacherIdsInSchedule = [
    ...new Set(
      nonValidatedInSchedule.map(s => (s.teachers as any)?.id).filter(Boolean)
    )
  ]

  // Réclamations
  const reclamaCount = reclamations?.length ?? 0
  const reclamaMajeures = reclamations?.filter(r => r.gravite === 'majeure' && !['resolue', 'cloturee'].includes(r.statut)).length ?? 0

  // Satisfaction
  const scores = enquetes?.filter(e => e.score_moyen !== null).map(e => e.score_moyen as number) ?? []
  const globalScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null
  const enquetesActives = enquetes?.filter(e => e.statut === 'active').length ?? 0

  // Améliorations
  const amelioCount = ameliorations?.length ?? 0
  const amelioEnCours = ameliorations?.filter(a => a.statut === 'en_cours').length ?? 0
  const amelioCritiques = ameliorations?.filter(a => a.priorite === 'critique' && a.statut !== 'realisee').length ?? 0

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">P6 — Amélioration</h1>
        <p className="text-slate-500 mt-1 text-sm">
          ISO 21001 — §9.1.2 Satisfaction · §9.2 Audits · §9.3 Revue · §10.2 NC & Réclamations · §10.3 Plan d'action
        </p>
      </div>

      {/* KPIs NC */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'NC Ouvertes',      value: counts.ouverte,  color: 'bg-white border-red-100',     icon: AlertTriangle,  iconCls: 'bg-red-50 text-red-500' },
          { label: 'En cours',         value: counts.en_cours, color: 'bg-white border-amber-100',   icon: ClipboardList,  iconCls: 'bg-amber-50 text-amber-500' },
          { label: 'Clôturées',        value: counts.cloturee, color: 'bg-white border-emerald-100', icon: CheckCircle2,   iconCls: 'bg-emerald-50 text-emerald-500' },
          { label: 'Majeures actives', value: counts.majeures, color: 'bg-white border-red-200',     icon: AlertTriangle,  iconCls: 'bg-red-50 text-red-600' },
        ].map(({ label, value, color, icon: Icon, iconCls }) => (
          <div key={label} className={`rounded-xl border ${color} p-5 flex items-center gap-4`}>
            <div className={`w-11 h-11 rounded-xl ${iconCls} flex items-center justify-center shrink-0`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alertes */}
      {counts.majeures > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-3">
          <AlertTriangle size={16} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">
            <strong>{counts.majeures} NC majeure{counts.majeures > 1 ? 's' : ''}</strong> non clôturée{counts.majeures > 1 ? 's' : ''} — Action prioritaire requise
          </p>
          <Link href={`/org/${orgId}/qualite/non-conformites`}
            className="ml-auto text-xs text-red-600 hover:underline font-medium whitespace-nowrap">
            Voir →
          </Link>
        </div>
      )}

      {reclamaMajeures > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-3">
          <MessageSquare size={16} className="text-orange-500 shrink-0" />
          <p className="text-sm text-orange-700">
            <strong>{reclamaMajeures} réclamation{reclamaMajeures > 1 ? 's' : ''} majeure{reclamaMajeures > 1 ? 's' : ''}</strong> non résolue{reclamaMajeures > 1 ? 's' : ''} — Traitement requis
          </p>
          <Link href={`/org/${orgId}/qualite/reclamations`}
            className="ml-auto text-xs text-orange-600 hover:underline font-medium whitespace-nowrap">
            Voir →
          </Link>
        </div>
      )}

      {amelioCritiques > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-3">
          <TrendingUp size={16} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">
            <strong>{amelioCritiques} amélioration{amelioCritiques > 1 ? 's' : ''} critique{amelioCritiques > 1 ? 's' : ''}</strong> non réalisée{amelioCritiques > 1 ? 's' : ''}
          </p>
          <Link href={`/org/${orgId}/qualite/ameliorations`}
            className="ml-auto text-xs text-red-600 hover:underline font-medium whitespace-nowrap">
            Voir →
          </Link>
        </div>
      )}

      {teacherIdsInSchedule.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-3">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle size={16} className="text-amber-500 shrink-0" />
            <p className="text-sm text-amber-800 font-semibold">
              {teacherIdsInSchedule.length} enseignant{teacherIdsInSchedule.length > 1 ? 's' : ''} non validé{teacherIdsInSchedule.length > 1 ? 's' : ''} SUP2I dans l'emploi du temps
            </p>
          </div>
          <Link href={`/org/${orgId}/qualite/non-conformites/new?category=sup2i&source=automatique`}
            className="ml-7 inline-flex items-center gap-1.5 text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors font-medium">
            <Plus size={12} /> Ouvrir une NC SUP2I
          </Link>
        </div>
      )}

      {overdueNcs.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-3">
          <AlertTriangle size={16} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">
            <strong>{overdueNcs.length} NC</strong> avec délai OCAP dépassé
          </p>
          <Link href={`/org/${orgId}/qualite/non-conformites`}
            className="ml-auto text-xs text-red-600 hover:underline font-medium">
            Voir →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">

        {/* NC récentes */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <ClipboardList size={15} className="text-slate-400" />
              Non-Conformités récentes
            </h2>
            <Link href={`/org/${orgId}/qualite/non-conformites`}
              className="text-xs text-[#1B3A6B] hover:underline font-medium">
              Voir tout →
            </Link>
          </div>
          {recentNcs.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <CheckCircle2 size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400 mb-3">Aucune NC enregistrée</p>
              <Link href={`/org/${orgId}/qualite/non-conformites/new`}
                className="text-xs text-[#1B3A6B] hover:underline font-medium">
                + Ouvrir une NC
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentNcs.map(nc => {
                const catMeta = NC_CATEGORY_META[nc.category as NcCategory]
                const sevMeta = NC_SEVERITY_META[nc.severity as keyof typeof NC_SEVERITY_META]
                return (
                  <Link key={nc.id} href={`/org/${orgId}/qualite/non-conformites/${nc.id}`}
                    className="flex items-center px-5 py-3.5 hover:bg-slate-50 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate group-hover:text-[#1B3A6B]">
                        {nc.title}
                      </p>
                      <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${catMeta?.badgeCls ?? ''}`}>
                        {catMeta?.label ?? nc.category}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ml-3 ${sevMeta?.cls ?? ''}`}>
                      {sevMeta?.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
          <div className="px-5 py-3 border-t border-slate-50">
            <Link href={`/org/${orgId}/qualite/non-conformites/new`}
              className="text-xs text-[#1B3A6B] hover:underline font-medium">
              + Ouvrir une NC
            </Link>
          </div>
        </div>

        {/* Modules amélioration */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 text-sm mb-4">Modules P6</h2>
          <div className="space-y-2">
            {[
              {
                label: 'Non-Conformités (§10.2)',
                href:  `/org/${orgId}/qualite/non-conformites`,
                icon:  ClipboardList,
                info:  `${counts.ouverte} ouvertes`,
                alert: counts.majeures > 0,
              },
              {
                label: 'Réclamations (§10.2)',
                href:  `/org/${orgId}/qualite/reclamations`,
                icon:  MessageSquare,
                info:  reclamaCount > 0 ? `${reclamaCount} total · ${reclamaMajeures} majeures` : 'Aucune',
                alert: reclamaMajeures > 0,
              },
              {
                label: 'Satisfaction (§9.1.2)',
                href:  `/org/${orgId}/qualite/satisfaction`,
                icon:  Star,
                info:  globalScore ? `Score moyen : ${globalScore}/5` : enquetesActives > 0 ? `${enquetesActives} active(s)` : 'Aucune enquête',
                alert: false,
              },
              {
                label: 'Audits internes (§9.2)',
                href:  `/org/${orgId}/qualite/audits`,
                icon:  ClipboardCheck,
                info:  audits?.length ? `${auditsRealises} réalisés · ${auditsPlanifies} planifiés` : 'Planning à générer',
                alert: false,
              },
              {
                label: 'Revue de direction (§9.3)',
                href:  `/org/${orgId}/qualite/revue`,
                icon:  BookOpen,
                info:  lastReview
                  ? `Dernière : ${new Date(lastReview.review_date ?? '').toLocaleDateString('fr-FR')}`
                  : 'Aucune revue réalisée',
                alert: false,
              },
              {
                label: 'Journal d\'amélioration (§10.3)',
                href:  `/org/${orgId}/qualite/ameliorations`,
                icon:  TrendingUp,
                info:  amelioCount > 0 ? `${amelioEnCours} en cours · ${amelioCritiques} critiques` : 'Plan vide — synchroniser',
                alert: amelioCritiques > 0,
              },
            ].map(m => (
              <Link key={m.href} href={m.href}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg
                           bg-[#1B3A6B]/5 border border-[#1B3A6B]/10
                           hover:bg-[#1B3A6B]/10 transition-colors group">
                <div className="flex items-center gap-2">
                  <m.icon size={14} className="text-[#1B3A6B]" />
                  <span className="text-sm font-medium text-[#1B3A6B]">{m.label}</span>
                  {m.alert && <AlertTriangle size={13} className="text-red-500" />}
                </div>
                <div className="flex items-center gap-1 text-xs text-[#1B3A6B] font-semibold">
                  {m.info} <ChevronRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
