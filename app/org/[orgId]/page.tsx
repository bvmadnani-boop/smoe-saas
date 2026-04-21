import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import {
  GraduationCap, UserCheck, ClipboardList,
  AlertTriangle, TrendingUp, ChevronRight,
  CheckCircle2, Clock, Megaphone,
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
    { count: nbLeads },
    { count: nbInscriptions },
    { count: nbNC },
    { data: recentStudents },
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase.from('inscriptions').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'pending'),
    supabase.from('non_conformities').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'open'),
    supabase
      .from('students')
      .select('id, student_code, full_name, status, created_at')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const kpis = [
    { label: 'Étudiants actifs',     value: nbStudents    ?? 0, icon: GraduationCap, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
    { label: 'Leads en cours',       value: nbLeads       ?? 0, icon: Megaphone,     color: 'bg-blue-50 text-blue-600',       border: 'border-blue-100' },
    { label: 'Inscriptions pending', value: nbInscriptions ?? 0, icon: ClipboardList, color: 'bg-violet-50 text-violet-600',   border: 'border-violet-100' },
    { label: 'NC ouvertes',          value: nbNC          ?? 0, icon: AlertTriangle,  color: 'bg-amber-50 text-amber-600',     border: 'border-amber-100' },
  ]

  const statusLabel: Record<string, { label: string; cls: string }> = {
    active:     { label: 'Actif',      cls: 'bg-emerald-50 text-emerald-600' },
    inactive:   { label: 'Inactif',    cls: 'bg-slate-100 text-slate-500' },
    graduated:  { label: 'Diplômé',    cls: 'bg-blue-50 text-blue-600' },
    suspended:  { label: 'Suspendu',   cls: 'bg-red-50 text-red-500' },
    enrolled:   { label: 'Inscrit',    cls: 'bg-violet-50 text-violet-600' },
  }

  const processus = [
    { label: 'P1 — Marketing',   href: `/org/${orgId}/marketing`,   icon: Megaphone,     desc: 'Campagnes & leads' },
    { label: 'P2 — Commercial',  href: `/org/${orgId}/commercial`,  icon: UserCheck,     desc: 'Suivi prospects' },
    { label: 'P3 — Inscription', href: `/org/${orgId}/inscription`, icon: ClipboardList, desc: 'Dossiers étudiants' },
    { label: 'P4 — Scolarité',   href: `/org/${orgId}/scolarite`,   icon: TrendingUp,    desc: 'Suivi pédagogique' },
    { label: 'P5 — Diplomation', href: `/org/${orgId}/diplomation`, icon: CheckCircle2,  desc: 'Diplômes & cérémonie' },
  ]

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Tableau de bord
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          {org.name} {org.city ? `— ${org.city}` : ''} · Vue générale
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {kpis.map(({ label, value, icon: Icon, color, border }) => (
          <div key={label} className={`bg-white rounded-xl border ${border} p-5 flex items-center gap-4`}>
            <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shrink-0`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500 leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Processus de réalisation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp size={15} className="text-slate-400" />
          Processus de réalisation
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {processus.map(({ label, href, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col items-center gap-2 px-3 py-4 rounded-xl
                         bg-slate-50 hover:bg-[#1B3A6B] transition-colors text-center"
            >
              <Icon size={22} className="text-slate-400 group-hover:text-white transition-colors" />
              <p className="text-xs font-semibold text-slate-700 group-hover:text-white transition-colors leading-tight">
                {label}
              </p>
              <p className="text-xs text-slate-400 group-hover:text-blue-200 transition-colors">
                {desc}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Étudiants récents */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <GraduationCap size={15} className="text-slate-400" />
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
                      {s.full_name?.split(' ').map((n: string) => n[0]).slice(0,2).join('')}
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
