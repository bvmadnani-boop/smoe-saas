import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Lightbulb, Rocket, TrendingUp, Trophy,
  ChevronRight, Plus, DollarSign, Users,
} from 'lucide-react'
import { PROJET_STADE_META, STADE_PIPELINE, type ProjetStade } from '@/lib/incubateur-templates'

export const dynamic = 'force-dynamic'

export default async function IncubateurPage({
  params,
}: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  const supabase = await createClient()

  const [
    { data: projets },
    { data: pitchs },
    { data: financements },
    { data: sessions },
  ] = await Promise.all([
    supabase.from('incubateur_projets').select('id, nom, stade, score_maturite, secteur, date_entree').eq('organization_id', orgId).neq('stade', 'abandonne').order('score_maturite', { ascending: false }),
    supabase.from('incubateur_pitchs').select('id, statut, score, type').eq('organization_id', orgId),
    supabase.from('incubateur_financements').select('id, statut, montant_obtenu').eq('organization_id', orgId),
    supabase.from('incubateur_sessions').select('id').eq('organization_id', orgId),
  ])

  const p = projets ?? []
  const totalProjets = p.length
  const lances = p.filter(pr => pr.stade === 'lancement').length
  const totalFinancement = (financements ?? [])
    .filter(f => f.statut === 'obtenu')
    .reduce((acc, f) => acc + (f.montant_obtenu ?? 0), 0)
  const pitchsRealises = (pitchs ?? []).filter(pt => pt.statut === 'realise').length

  // Répartition par stade
  const stadeCount: Record<string, number> = {}
  STADE_PIPELINE.forEach(s => { stadeCount[s] = p.filter(pr => pr.stade === s).length })

  const recentProjets = p.slice(0, 5)

  function formatMontant(n: number) {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M MAD`
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K MAD`
    return `${n} MAD`
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Incubateur</h1>
        <p className="text-slate-500 mt-1 text-sm">Programme d'accompagnement à la création d'entreprise · Idéation → Lancement</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Projets actifs',    value: totalProjets,                    icon: Lightbulb,  cls: 'border-slate-200',   iconCls: 'bg-slate-100 text-slate-500' },
          { label: 'Projets lancés',    value: lances,                          icon: Rocket,     cls: 'border-emerald-100', iconCls: 'bg-emerald-50 text-emerald-500' },
          { label: 'Financements',      value: formatMontant(totalFinancement), icon: DollarSign, cls: 'border-blue-100',    iconCls: 'bg-blue-50 text-blue-500' },
          { label: 'Pitchs réalisés',   value: pitchsRealises,                  icon: Trophy,     cls: 'border-amber-100',   iconCls: 'bg-amber-50 text-amber-500' },
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

      {/* Pipeline visuel */}
      {totalProjets > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h2 className="font-semibold text-slate-800 text-sm mb-4">Pipeline — Stades de maturité</h2>
          <div className="flex items-stretch gap-2">
            {STADE_PIPELINE.map((stade, i) => {
              const meta = PROJET_STADE_META[stade]
              const count = stadeCount[stade] ?? 0
              const isLast = i === STADE_PIPELINE.length - 1
              return (
                <div key={stade} className="flex items-center gap-2 flex-1">
                  <div className={`flex-1 rounded-xl border-2 p-4 text-center transition-all ${count > 0 ? meta.cls + ' border-current/30' : 'border-slate-100 bg-slate-50'}`}>
                    <div className="text-2xl mb-1">{meta.icon}</div>
                    <p className={`text-xl font-bold ${count > 0 ? '' : 'text-slate-300'}`}>{count}</p>
                    <p className={`text-xs font-medium mt-0.5 ${count > 0 ? '' : 'text-slate-400'}`}>{meta.label}</p>
                  </div>
                  {!isLast && <ChevronRight size={16} className="text-slate-300 shrink-0" />}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Projets récents */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <Lightbulb size={15} className="text-slate-400" /> Projets incubés
            </h2>
            <Link href={`/org/${orgId}/incubateur/projets`} className="text-xs text-[#1B3A6B] hover:underline font-medium">
              Voir tout →
            </Link>
          </div>
          {recentProjets.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Lightbulb size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400 mb-3">Aucun projet incubé</p>
              <Link href={`/org/${orgId}/incubateur/projets`} className="text-xs text-[#1B3A6B] hover:underline font-medium">
                + Ajouter un projet
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentProjets.map(pr => {
                const stageMeta = PROJET_STADE_META[pr.stade as ProjetStade]
                const scoreBarCls = pr.score_maturite < 40 ? 'bg-slate-400' : pr.score_maturite < 70 ? 'bg-amber-400' : 'bg-emerald-400'
                return (
                  <Link key={pr.id} href={`/org/${orgId}/incubateur/projets/${pr.id}`}
                    className="flex items-center px-5 py-3.5 hover:bg-slate-50 transition-colors group gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1B3A6B]/10 flex items-center justify-center shrink-0">
                      <span className="text-base">{stageMeta.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate group-hover:text-[#1B3A6B]">{pr.nom}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {pr.secteur && <span className="text-xs text-slate-400">{pr.secteur}</span>}
                        <div className="flex items-center gap-1 ml-auto">
                          <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-1 rounded-full ${scoreBarCls}`} style={{ width: `${pr.score_maturite}%` }} />
                          </div>
                          <span className="text-xs text-slate-500 font-medium">{pr.score_maturite}%</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-lg border font-medium shrink-0 ${stageMeta.cls}`}>
                      {stageMeta.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
          <div className="px-5 py-3 border-t border-slate-50">
            <Link href={`/org/${orgId}/incubateur/projets`} className="text-xs text-[#1B3A6B] hover:underline font-medium">
              + Nouveau projet
            </Link>
          </div>
        </div>

        {/* Modules */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 text-sm mb-4">Programme incubateur</h2>
          <div className="space-y-2">
            {[
              { label: 'Projets',            href: `/org/${orgId}/incubateur/projets`, icon: Lightbulb,  info: `${totalProjets} actifs · ${lances} lancés` },
              { label: 'Sessions coaching',  href: `/org/${orgId}/incubateur/projets`, icon: Users,      info: `${sessions?.length ?? 0} sessions` },
              { label: 'Pitchs',             href: `/org/${orgId}/incubateur/projets`, icon: Trophy,     info: `${pitchsRealises} réalisés` },
              { label: 'Financements',       href: `/org/${orgId}/incubateur/projets`, icon: DollarSign, info: totalFinancement > 0 ? formatMontant(totalFinancement) + ' levés' : 'Aucun encore' },
              { label: 'Jalons & Roadmap',   href: `/org/${orgId}/incubateur/projets`, icon: TrendingUp, info: 'Par projet' },
            ].map(m => (
              <Link key={m.label} href={m.href}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#1B3A6B]/5 border border-[#1B3A6B]/10 hover:bg-[#1B3A6B]/10 transition-colors group">
                <div className="flex items-center gap-2">
                  <m.icon size={14} className="text-[#1B3A6B]" />
                  <span className="text-sm font-medium text-[#1B3A6B]">{m.label}</span>
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
