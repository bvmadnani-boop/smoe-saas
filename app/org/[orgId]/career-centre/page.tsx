import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Users, Briefcase, Star, TrendingUp, BookOpen,
  Calendar, Building2, ChevronRight, AlertTriangle, Award,
} from 'lucide-react'
import { NIVEAU_META, getNiveau, OFFRE_TYPE_META, ATELIER_TYPE_META } from '@/lib/career-templates'

export const dynamic = 'force-dynamic'

export default async function CareerCentrePage({
  params,
}: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  const supabase = await createClient()

  const [
    { data: profils },
    { data: ateliers },
    { data: offres },
    { data: entreprises },
    { data: evenements },
    { data: mentoring },
  ] = await Promise.all([
    supabase.from('career_profils').select('id, score, niveau, date_insertion, filiere_id').eq('organization_id', orgId),
    supabase.from('career_ateliers').select('id, titre, type, date_atelier, statut, nb_inscrits').eq('organization_id', orgId).order('date_atelier', { ascending: false }).limit(5),
    supabase.from('career_offres').select('id, titre, type, statut, entreprise_id, date_limite').eq('organization_id', orgId).eq('statut', 'active').order('created_at', { ascending: false }).limit(5),
    supabase.from('career_entreprises').select('id, nom, statut, convention').eq('organization_id', orgId),
    supabase.from('career_evenements').select('id, titre, type, date_evenement, statut').eq('organization_id', orgId).order('date_evenement', { ascending: false }).limit(3),
    supabase.from('career_mentoring').select('id, statut').eq('organization_id', orgId),
  ])

  const p = profils ?? []
  const totalProfils = p.length
  const taux_insertion = totalProfils > 0
    ? Math.round((p.filter(pr => pr.date_insertion).length / totalProfils) * 100)
    : 0
  const score_moyen = totalProfils > 0
    ? Math.round(p.reduce((acc, pr) => acc + (pr.score ?? 0), 0) / totalProfils)
    : 0
  const inserable = p.filter(pr => pr.niveau === 'inserable').length
  const niveauCounts = {
    debutant: p.filter(pr => pr.niveau === 'debutant').length,
    construction: p.filter(pr => pr.niveau === 'construction').length,
    active: p.filter(pr => pr.niveau === 'active').length,
    inserable,
  }

  const offresActive = offres?.length ?? 0
  const entreprisesPartenaires = entreprises?.filter(e => e.statut !== 'prospect').length ?? 0
  const mentoringRealise = mentoring?.filter(m => m.statut === 'realisee').length ?? 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Career Centre</h1>
        <p className="text-slate-500 mt-1 text-sm">Programme d'employabilité — Insertion professionnelle & développement de carrière</p>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Étudiants suivis',    value: totalProfils,           icon: Users,     cls: 'border-slate-200',    iconCls: 'bg-slate-100 text-slate-500' },
          { label: 'Score moyen',         value: `${score_moyen}/100`,   icon: Star,      cls: 'border-amber-100',    iconCls: 'bg-amber-50 text-amber-500' },
          { label: 'Taux d\'insertion',   value: `${taux_insertion}%`,   icon: TrendingUp,cls: 'border-emerald-100',  iconCls: 'bg-emerald-50 text-emerald-500' },
          { label: 'Offres actives',      value: offresActive,           icon: Briefcase, cls: 'border-blue-100',     iconCls: 'bg-blue-50 text-blue-500' },
        ].map(({ label, value, icon: Icon, cls, iconCls }) => (
          <div key={label} className={`bg-white rounded-xl border ${cls} p-5 flex items-center gap-4`}>
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

      {/* Score moyen progress + répartition niveaux */}
      {totalProfils > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 text-sm">Répartition par niveau d'employabilité</h2>
            <Link href={`/org/${orgId}/career-centre/profils`} className="text-xs text-[#1B3A6B] hover:underline font-medium">
              Voir tous →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {(Object.entries(NIVEAU_META) as [keyof typeof NIVEAU_META, typeof NIVEAU_META[keyof typeof NIVEAU_META]][]).map(([key, meta]) => {
              const count = niveauCounts[key]
              const pct = totalProfils > 0 ? Math.round((count / totalProfils) * 100) : 0
              return (
                <div key={key} className={`rounded-xl border p-4 text-center ${meta.cls}`}>
                  <div className="text-2xl mb-1">{meta.icon}</div>
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-xs font-medium">{meta.label}</p>
                  <div className="mt-2 text-xs opacity-70">{pct}%</div>
                </div>
              )
            })}
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-slate-500">Score moyen de la promotion</span>
              <span className="text-xs font-bold text-slate-700 ml-auto">{score_moyen} / 100</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-3 rounded-full transition-all ${score_moyen < 25 ? 'bg-slate-400' : score_moyen < 50 ? 'bg-amber-400' : score_moyen < 75 ? 'bg-blue-400' : 'bg-emerald-400'}`}
                style={{ width: `${score_moyen}%` }} />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Offres actives */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <Briefcase size={15} className="text-slate-400" /> Offres actives
            </h2>
            <Link href={`/org/${orgId}/career-centre/offres`} className="text-xs text-[#1B3A6B] hover:underline font-medium">
              Voir tout →
            </Link>
          </div>
          {!offres?.length ? (
            <div className="px-5 py-10 text-center">
              <Briefcase size={28} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Aucune offre active</p>
              <Link href={`/org/${orgId}/career-centre/offres`} className="text-xs text-[#1B3A6B] hover:underline mt-1 inline-block">+ Ajouter une offre</Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {offres.map(o => {
                const typeMeta = OFFRE_TYPE_META[o.type as keyof typeof OFFRE_TYPE_META]
                const isExpiring = o.date_limite && new Date(o.date_limite) < new Date(Date.now() + 7 * 86400000)
                return (
                  <div key={o.id} className="flex items-center px-5 py-3.5 hover:bg-slate-50 group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{o.titre}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${typeMeta?.cls}`}>
                        {typeMeta?.icon} {typeMeta?.label}
                      </span>
                    </div>
                    {isExpiring && <AlertTriangle size={13} className="text-amber-400 ml-2" />}
                    {o.date_limite && (
                      <span className="text-xs text-slate-400 ml-2">
                        {new Date(o.date_limite).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modules */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 text-sm mb-4">Programme d'employabilité</h2>
          <div className="space-y-2">
            {[
              {
                label: 'Profils étudiants',
                href: `/org/${orgId}/career-centre/profils`,
                icon: Users,
                info: totalProfils > 0 ? `${totalProfils} suivis · score ${score_moyen}/100` : 'Aucun profil',
                alert: false,
              },
              {
                label: 'Ateliers',
                href: `/org/${orgId}/career-centre/ateliers`,
                icon: BookOpen,
                info: ateliers?.length ? `${ateliers.filter(a => a.statut === 'planifie').length} planifiés` : 'Aucun atelier',
                alert: false,
              },
              {
                label: 'Événements',
                href: `/org/${orgId}/career-centre/evenements`,
                icon: Calendar,
                info: evenements?.filter(e => e.statut === 'planifie').length ? `${evenements.filter(e => e.statut === 'planifie').length} à venir` : 'Aucun événement',
                alert: false,
              },
              {
                label: 'Entreprises partenaires',
                href: `/org/${orgId}/career-centre/entreprises`,
                icon: Building2,
                info: `${entreprises?.length ?? 0} total · ${entreprisesPartenaires} partenaires`,
                alert: false,
              },
              {
                label: 'Offres d\'emploi/stage',
                href: `/org/${orgId}/career-centre/offres`,
                icon: Briefcase,
                info: `${offresActive} active${offresActive > 1 ? 's' : ''}`,
                alert: false,
              },
              {
                label: 'Mentoring',
                href: `/org/${orgId}/career-centre/mentoring`,
                icon: Award,
                info: mentoring?.length ? `${mentoringRealise} sessions réalisées` : 'Aucune session',
                alert: false,
              },
            ].map(m => (
              <Link key={m.href} href={m.href}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#1B3A6B]/5 border border-[#1B3A6B]/10 hover:bg-[#1B3A6B]/10 transition-colors group">
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
