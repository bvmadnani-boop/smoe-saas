import { createClient } from '@/lib/supabase/server'
import {
  Building2,
  GraduationCap,
  Users,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: nbOrgs },
    { count: nbStudents },
    { count: nbUsers },
    { count: nbNC },
    { data: orgs },
  ] = await Promise.all([
    supabase.from('organizations').select('*', { count: 'exact', head: true }),
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('non_conformities').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase
      .from('organizations')
      .select('id, name, city, is_active, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const kpis = [
    {
      label: 'Organisations',
      value: nbOrgs ?? 0,
      icon: Building2,
      color: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
    },
    {
      label: 'Étudiants inscrits',
      value: nbStudents ?? 0,
      icon: GraduationCap,
      color: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
    },
    {
      label: 'Utilisateurs',
      value: nbUsers ?? 0,
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
      border: 'border-purple-100',
    },
    {
      label: 'NC ouvertes',
      value: nbNC ?? 0,
      icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
    },
  ]

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Vue globale</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Tableau de bord Proximity Management — tous les territoires SUP2I
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {kpis.map(({ label, value, icon: Icon, color, border }) => (
          <div key={label} className={`bg-white rounded-xl border ${border} p-5 flex items-center gap-4`}>
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Organisations */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Building2 size={16} className="text-slate-400" />
            Organisations
          </h2>
          <a href="/admin/organisations" className="text-xs text-[#1B3A6B] hover:underline font-medium">
            Voir tout →
          </a>
        </div>

        {!orgs || orgs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Building2 size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Aucune organisation créée.</p>
            <a href="/admin/organisations/new" className="mt-3 inline-block text-sm text-[#1B3A6B] hover:underline font-medium">
              + Créer la première organisation
            </a>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {orgs.map((org) => (
              <a
                key={org.id}
                href={`/admin/organisations/${org.id}`}
                className="flex items-center px-6 py-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#1B3A6B] flex items-center justify-center shrink-0 mr-4">
                  <span className="text-white text-xs font-bold">
                    {org.name?.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 group-hover:text-[#1B3A6B] truncate">
                    {org.name}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} />
                    {org.city ?? 'Ville non renseignée'}
                  </p>
                </div>
                <div className="ml-4">
                  {org.is_active ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
                      <CheckCircle2 size={10} />
                      Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                      <Clock size={10} />
                      Inactif
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Processus + Modules */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-slate-400" />
            Processus de réalisation
          </h3>
          <div className="space-y-2">
            {[
              { label: 'P1 — Marketing',   href: '/admin/processus/marketing' },
              { label: 'P2 — Commercial',  href: '/admin/processus/commercial' },
              { label: 'P3 — Inscription', href: '/admin/processus/inscription' },
              { label: 'P4 — Scolarité',   href: '/admin/processus/scolarite' },
              { label: 'P5 — Diplomation', href: '/admin/processus/diplomation' },
            ].map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg
                           bg-slate-50 hover:bg-[#1B3A6B] hover:text-white group transition-colors"
              >
                <span className="text-sm text-slate-700 group-hover:text-white">{label}</span>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-white" />
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <ShieldCheck size={16} className="text-slate-400" />
            Modules SMOE
          </h3>
          <div className="space-y-2">
            {[
              { label: 'Career Centre',      href: '/admin/career-centre' },
              { label: 'Incubateur',         href: '/admin/incubateur' },
              { label: 'Non-conformités',    href: '/admin/qualite/nc' },
              { label: 'Audits internes',    href: '/admin/qualite/audits' },
              { label: 'GED — Documents',    href: '/admin/qualite/ged' },
              { label: 'Revue de direction', href: '/admin/qualite/revue' },
            ].map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg
                           bg-slate-50 hover:bg-[#1B3A6B] hover:text-white group transition-colors"
              >
                <span className="text-sm text-slate-700 group-hover:text-white">{label}</span>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-white" />
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
