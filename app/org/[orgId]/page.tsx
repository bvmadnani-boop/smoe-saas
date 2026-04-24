import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import {
  GraduationCap, UserCheck, ClipboardList,
  AlertTriangle, TrendingUp, ChevronRight,
  CheckCircle2, Clock, Megaphone, PenTool,
  BookOpen, Award, ShieldCheck, Wrench,
  Briefcase, Lightbulb, Rocket,
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function OrgDashboard({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, city')
    .eq('id', orgId)
    .single()

  if (!org) notFound()

  const [
    { count: nbStudents },
    { count: nbInscrits },
    { count: nbFormations },
    { count: nbReferentiels },
    { count: nbNC },
    { count: nbProjets },
    { data: recentStudents },
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'inscrit'),
    supabase.from('formations').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase.from('referentiels_competences').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('is_active', true),
    supabase.from('nonconformities').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'ouverte'),
    supabase.from('incubateur_projets').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).neq('stade', 'abandonne'),
    supabase
      .from('students')
      .select('id, student_code, full_name, status, created_at')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const kpis = [
    {
      label: 'Étudiants',
      value: nbStudents ?? 0,
      sub: `${nbInscrits ?? 0} inscrits actifs`,
      icon: GraduationCap,
      color: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
      href: `/org/${orgId}/inscription`,
    },
    {
      label: 'Formations',
      value: nbFormations ?? 0,
      sub: 'Programmes actifs',
      icon: PenTool,
      color: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
      href: `/org/${orgId}/conception/formations`,
    },
    {
      label: 'Référentiels',
      value: nbReferentiels ?? 0,
      sub: 'Référentiels compétences',
      icon: BookOpen,
      color: 'bg-violet-50 text-violet-600',
      border: 'border-violet-100',
      href: `/org/${orgId}/conception/referentiels`,
    },
    {
      label: 'NC ouvertes',
      value: nbNC ?? 0,
      sub: 'Non-conformités',
      icon: AlertTriangle,
      color: nbNC && nbNC > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400',
      border: nbNC && nbNC > 0 ? 'border-amber-200' : 'border-slate-200',
      href: `/org/${orgId}/qualite/non-conformites`,
    },
    {
      label: 'Projets',
      value: nbProjets ?? 0,
      sub: 'En incubation',
      icon: Rocket,
      color: 'bg-orange-50 text-orange-500',
      border: 'border-orange-100',
      href: `/org/${orgId}/incubateur/projets`,
    },
  ]

  const processus = [
    { label: 'P1',   name: 'Management',  href: `/org/${orgId}/management`,  icon: Megaphone,     desc: 'Pilotage & stratégie' },
    { label: 'P2',   name: 'Conception',  href: `/org/${orgId}/conception`,   icon: PenTool,       desc: 'Formations & référentiels' },
    { label: 'P3',   name: 'Inscription', href: `/org/${orgId}/inscription`,  icon: ClipboardList, desc: 'Dossiers étudiants' },
    { label: 'P4',   name: 'Scolarité',   href: `/org/${orgId}/scolarite`,    icon: BookOpen,      desc: 'Suivi pédagogique' },
    { label: 'P5',   name: 'Diplomation', href: `/org/${orgId}/diplomation`,  icon: Award,         desc: 'Diplômes & PFE' },
    { label: 'P6',   name: 'Amélioration',href: `/org/${orgId}/qualite`,      icon: ShieldCheck,   desc: 'Qualité & conformité' },
    { label: 'P7',   name: 'Support',     href: `/org/${orgId}/support`,      icon: Wrench,        desc: 'RH · Infra · Docs' },
  ]

  const transversal = [
    { name: 'Career Centre', href: `/org/${orgId}/career-centre`, icon: Briefcase, desc: 'Offres, mentoring, entreprises', color: 'bg-sky-50 border-sky-200 hover:border-sky-400' },
    { name: 'Incubateur',    href: `/org/${orgId}/incubateur`,    icon: Lightbulb, desc: 'Startups, projets, incubation',  color: 'bg-orange-50 border-orange-200 hover:border-orange-400' },
  ]

  const statusLabel: Record<string, { label: string; cls: string }> = {
    inscrit:  { label: 'Inscrit',  cls: 'bg-violet-50 text-violet-600' },
    actif:    { label: 'Actif',    cls: 'bg-emerald-50 text-emerald-600' },
    diplome:  { label: 'Diplômé', cls: 'bg-blue-50 text-blue-600' },
    suspendu: { label: 'Suspendu', cls: 'bg-red-50 text-red-500' },
    inactif:  { label: 'Inactif',  cls: 'bg-slate-100 text-slate-500' },
  }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500 mt-1 text-sm">
          {org.name}{org.city ? ` — ${org.city}` : ''} · Vue générale
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-7">
        {kpis.map(({ label, value, sub, icon: Icon, color, border, href }) => (
          <Link key={label} href={href}
            className={`bg-white rounded-xl border ${border} p-5 flex items-center gap-4
                        hover:shadow-sm transition-shadow group`}>
            <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shrink-0`}>
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs font-medium text-slate-600 leading-tight group-hover:text-[#1B3A6B]">{label}</p>
              <p className="text-[10px] text-slate-400 leading-tight truncate">{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Processus ISO 21001 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 text-sm">
          <TrendingUp size={14} className="text-slate-400" />
          Processus ISO 21001
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-7 gap-2">
          {processus.map(({ label, name, href, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col items-center gap-2 px-2 py-4 rounded-xl
                         bg-slate-50 hover:bg-[#1B3A6B] transition-colors text-center"
            >
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-300 font-mono">
                {label}
              </span>
              <Icon size={20} className="text-slate-400 group-hover:text-white transition-colors" />
              <p className="text-xs font-semibold text-slate-700 group-hover:text-white transition-colors leading-tight">
                {name}
              </p>
              <p className="text-[10px] text-slate-400 group-hover:text-blue-200 transition-colors leading-tight">
                {desc}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Modules transverses */}
      <div className="grid grid-cols-2 gap-4 mb-7">
        {transversal.map(({ name, href, icon: Icon, desc, color }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-4 p-5 rounded-xl border bg-white ${color} transition-colors group`}
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
              <Icon size={18} className="text-slate-500 group-hover:text-[#1B3A6B]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 group-hover:text-[#1B3A6B]">{name}</p>
              <p className="text-xs text-slate-400">{desc}</p>
            </div>
            <ChevronRight size={14} className="ml-auto text-slate-300 group-hover:text-[#1B3A6B]" />
          </Link>
        ))}
      </div>

      {/* Étudiants récents */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
            <GraduationCap size={14} className="text-slate-400" />
            Étudiants récents
          </h2>
          <Link href={`/org/${orgId}/inscription`} className="text-xs text-[#1B3A6B] hover:underline font-medium">
            Voir tout →
          </Link>
        </div>

        {!recentStudents || recentStudents.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <GraduationCap size={36} className="text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Aucun étudiant inscrit.</p>
            <Link
              href={`/org/${orgId}/inscription/new`}
              className="mt-3 inline-block text-sm text-[#1B3A6B] hover:underline font-medium"
            >
              + Inscrire le premier étudiant
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentStudents.map((s) => {
              const st = statusLabel[s.status] ?? { label: s.status, cls: 'bg-slate-100 text-slate-500' }
              return (
                <Link
                  key={s.id}
                  href={`/org/${orgId}/inscription/${s.id}`}
                  className="flex items-center px-6 py-3.5 hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1B3A6B]/10 flex items-center justify-center mr-3 shrink-0">
                    <span className="text-[#1B3A6B] text-xs font-bold">
                      {s.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800 group-hover:text-[#1B3A6B]">
                      {s.full_name}
                    </p>
                    <p className="text-xs text-slate-400">{s.student_code}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>
                    {st.label}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
