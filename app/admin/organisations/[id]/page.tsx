import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Building2, MapPin, Mail, Phone, Users,
  GraduationCap, CheckCircle2, Clock, ArrowLeft,
  TrendingUp, ShieldCheck,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function OrgDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single()

  if (!org) notFound()

  // Stats de l'organisation
  const [
    { count: nbStudents },
    { count: nbUsers },
    { count: nbNC },
    { data: users },
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('organization_id', id),
    supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('organization_id', id),
    supabase.from('non_conformities').select('*', { count: 'exact', head: true }).eq('organization_id', id).eq('status', 'open'),
    supabase.from('user_profiles').select('id, full_name, role, created_at').eq('organization_id', id).limit(10),
  ])

  const roleLabel: Record<string, string> = {
    org_admin:    'Admin Opérateur',
    staff:        'Staff',
    sup2i_viewer: 'SUP2I (lecture)',
    super_admin:  'Super Admin PM',
  }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/organisations" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-4">
          <ArrowLeft size={14} /> Retour aux organisations
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1B3A6B] flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {org.name?.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{org.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                {org.code && (
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">
                    {org.code}
                  </span>
                )}
                {org.city && (
                  <span className="text-sm text-slate-500 flex items-center gap-1">
                    <MapPin size={12} />
                    {[org.city, org.region].filter(Boolean).join(', ')}
                  </span>
                )}
                {org.is_active ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                    <CheckCircle2 size={10} /> Actif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                    <Clock size={10} /> Inactif
                  </span>
                )}
              </div>
            </div>
          </div>
          <Link
            href={`/admin/organisations/${id}/edit`}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Modifier
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Étudiants', value: nbStudents ?? 0, icon: GraduationCap, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Utilisateurs', value: nbUsers ?? 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'NC ouvertes', value: nbNC ?? 0, icon: ShieldCheck, color: 'text-amber-600 bg-amber-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Infos contact */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Building2 size={15} className="text-slate-400" />
            Informations
          </h3>
          <dl className="space-y-3">
            {[
              { label: 'Pays',     value: org.country },
              { label: 'Adresse', value: org.address },
            ].filter(r => r.value).map(({ label, value }) => (
              <div key={label} className="flex gap-3">
                <dt className="text-xs text-slate-400 w-20 shrink-0 pt-0.5">{label}</dt>
                <dd className="text-sm text-slate-700">{value}</dd>
              </div>
            ))}
            {org.email && (
              <div className="flex gap-3">
                <dt className="text-xs text-slate-400 w-20 shrink-0 pt-0.5">Email</dt>
                <dd className="text-sm text-slate-700 flex items-center gap-1">
                  <Mail size={12} className="text-slate-400" /> {org.email}
                </dd>
              </div>
            )}
            {org.phone && (
              <div className="flex gap-3">
                <dt className="text-xs text-slate-400 w-20 shrink-0 pt-0.5">Téléphone</dt>
                <dd className="text-sm text-slate-700 flex items-center gap-1">
                  <Phone size={12} className="text-slate-400" /> {org.phone}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Utilisateurs */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Users size={15} className="text-slate-400" />
              Utilisateurs
            </h3>
            <Link
              href={`/admin/organisations/${id}/users/new`}
              className="text-xs text-[#1B3A6B] hover:underline font-medium"
            >
              + Ajouter
            </Link>
          </div>
          {!users || users.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Aucun utilisateur</p>
          ) : (
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{u.full_name}</p>
                    <p className="text-xs text-slate-400">{roleLabel[u.role] ?? u.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Accès rapide processus */}
      <div className="mt-4 bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp size={15} className="text-slate-400" />
          Accès rapide — Processus SUP2I
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {[
            { label: 'P1 Marketing',   href: `/org/${id}/marketing` },
            { label: 'P2 Commercial',  href: `/org/${id}/commercial` },
            { label: 'P3 Inscription', href: `/org/${id}/inscription` },
            { label: 'P4 Scolarité',   href: `/org/${id}/scolarite` },
            { label: 'P5 Diplomation', href: `/org/${id}/diplomation` },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-center px-3 py-3 rounded-lg bg-slate-50 hover:bg-[#1B3A6B]
                         hover:text-white text-sm text-slate-700 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
