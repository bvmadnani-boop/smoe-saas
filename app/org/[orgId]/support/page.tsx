import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Users, Wrench, FolderOpen, MessageSquare,
  CheckCircle2, AlertTriangle, ChevronRight, Calendar,
  ShieldCheck, BookOpen,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SupportPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  const [
    { count: nbPersonnel },
    { count: nbEquipements },
    { count: nbDocuments },
    { count: nbPersonnelActif },
    { count: nbEquipHS },
    { count: nbDocExpires },
    { data: recentPersonnel },
    { data: equipMaintenanceProche },
  ] = await Promise.all([
    supabase.from('support_personnel').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase.from('support_equipments').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase.from('support_documents').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'actif'),
    supabase.from('support_personnel').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'actif'),
    supabase.from('support_equipments').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'hors_service'),
    supabase.from('support_documents').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).lt('review_date', new Date().toISOString()).neq('status', 'archive'),
    supabase.from('support_personnel').select('id, full_name, role, contract_type, status, sensibilisation_done').eq('organization_id', orgId).eq('status', 'actif').order('created_at', { ascending: false }).limit(5),
    supabase.from('support_equipments').select('id, name, category, status, next_maintenance, location').eq('organization_id', orgId).neq('status', 'hors_service').not('next_maintenance', 'is', null).order('next_maintenance', { ascending: true }).limit(4),
  ])

  const modules = [
    {
      href:    `/org/${orgId}/support/rh`,
      label:   'Ressources humaines',
      ref:     '§7.1.2 · §7.2 · §7.3',
      icon:    Users,
      iconCls: 'bg-blue-100 text-blue-600',
      desc:    'Personnel · Compétences · Sensibilisation',
      stat:    nbPersonnelActif ?? 0,
      statLabel: 'actifs',
      alert:   false,
    },
    {
      href:    `/org/${orgId}/support/infrastructure`,
      label:   'Infrastructure & Équipements',
      ref:     '§7.1.3 · §7.1.4',
      icon:    Wrench,
      iconCls: 'bg-orange-100 text-orange-600',
      desc:    'Bâtiments · Matériels · Environnement de travail',
      stat:    nbEquipements ?? 0,
      statLabel: 'équipements',
      alert:   (nbEquipHS ?? 0) > 0,
    },
    {
      href:    `/org/${orgId}/support/documents`,
      label:   'Informations documentées',
      ref:     '§7.5',
      icon:    FolderOpen,
      iconCls: 'bg-violet-100 text-violet-600',
      desc:    'Procédures · Instructions · Formulaires · Enregistrements',
      stat:    nbDocuments ?? 0,
      statLabel: 'actifs',
      alert:   (nbDocExpires ?? 0) > 0,
    },
    {
      href:    `/org/${orgId}/support/communication`,
      label:   'Communication',
      ref:     '§7.4',
      icon:    MessageSquare,
      iconCls: 'bg-emerald-100 text-emerald-600',
      desc:    'Plan de communication interne & externe',
      stat:    null,
      statLabel: '',
      alert:   false,
    },
  ]

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">P7 — Support</h1>
        <p className="text-slate-500 mt-1 text-sm">
          ISO 21001 Chapitre 7 — Ressources · Compétences · Communication · Informations documentées
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Personnel actif',     value: nbPersonnelActif ?? 0, icon: Users,      cls: 'border-blue-100',    iconCls: 'bg-blue-50 text-blue-600'      },
          { label: 'Équipements',          value: nbEquipements    ?? 0, icon: Wrench,     cls: 'border-orange-100',  iconCls: 'bg-orange-50 text-orange-600'  },
          { label: 'Documents actifs',     value: nbDocuments      ?? 0, icon: FolderOpen, cls: 'border-violet-100',  iconCls: 'bg-violet-50 text-violet-600'  },
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

      {/* Alertes */}
      {(nbEquipHS ?? 0) > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-3">
          <AlertTriangle size={16} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">
            <strong>{nbEquipHS} équipement{(nbEquipHS ?? 0) > 1 ? 's' : ''} hors service</strong> — intervention requise
          </p>
          <Link href={`/org/${orgId}/support/infrastructure`}
            className="ml-auto text-xs text-red-600 hover:underline font-medium whitespace-nowrap">
            Voir →
          </Link>
        </div>
      )}
      {(nbDocExpires ?? 0) > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-3">
          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">
            <strong>{nbDocExpires} document{(nbDocExpires ?? 0) > 1 ? 's' : ''}</strong> avec date de révision dépassée
          </p>
          <Link href={`/org/${orgId}/support/documents`}
            className="ml-auto text-xs text-amber-600 hover:underline font-medium whitespace-nowrap">
            Voir →
          </Link>
        </div>
      )}

      {/* Modules */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        {modules.map(m => (
          <Link key={m.href} href={m.href}
            className="flex items-center bg-white rounded-xl border border-slate-200 px-6 py-5
                       hover:border-[#1B3A6B]/30 hover:shadow-sm transition-all group">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mr-4 ${m.iconCls}`}>
              <m.icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  {m.ref}
                </span>
                <h2 className="font-semibold text-slate-900 group-hover:text-[#1B3A6B] transition-colors">
                  {m.label}
                </h2>
                {m.alert && <AlertTriangle size={14} className="text-amber-500" />}
              </div>
              <p className="text-xs text-slate-400">{m.desc}</p>
              {m.stat !== null && (
                <p className="text-xs text-emerald-600 font-medium mt-0.5">
                  {m.stat} {m.statLabel}
                </p>
              )}
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-[#1B3A6B] transition-colors shrink-0 ml-4" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Personnel récent */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <Users size={15} className="text-slate-400" />
              Personnel actif
            </h2>
            <Link href={`/org/${orgId}/support/rh`}
              className="text-xs text-[#1B3A6B] hover:underline font-medium">
              Voir tout →
            </Link>
          </div>
          {!recentPersonnel || recentPersonnel.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Users size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400 mb-3">Aucun personnel enregistré</p>
              <Link href={`/org/${orgId}/support/rh/new`}
                className="text-xs text-[#1B3A6B] hover:underline font-medium">
                + Ajouter un membre
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentPersonnel.map(p => (
                <div key={p.id} className="flex items-center px-5 py-3 gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1B3A6B]/10 flex items-center justify-center shrink-0">
                    <span className="text-[#1B3A6B] text-xs font-bold">
                      {p.full_name?.split(' ').map((n: string) => n[0]).slice(0,2).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.full_name}</p>
                    <p className="text-xs text-slate-400">{p.role}</p>
                  </div>
                  {!p.sensibilisation_done && (
                    <span title="Sensibilisation ISO non complétée"
                      className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                      Sens. ⚠
                    </span>
                  )}
                  {p.sensibilisation_done && (
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="px-5 py-3 border-t border-slate-50">
            <Link href={`/org/${orgId}/support/rh/new`}
              className="text-xs text-[#1B3A6B] hover:underline font-medium">
              + Ajouter un membre
            </Link>
          </div>
        </div>

        {/* Maintenance à venir */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <Calendar size={15} className="text-slate-400" />
              Maintenance à venir
            </h2>
            <Link href={`/org/${orgId}/support/infrastructure`}
              className="text-xs text-[#1B3A6B] hover:underline font-medium">
              Voir tout →
            </Link>
          </div>
          {!equipMaintenanceProche || equipMaintenanceProche.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Wrench size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Aucune maintenance planifiée</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {equipMaintenanceProche.map(eq => {
                const isOverdue = eq.next_maintenance && new Date(eq.next_maintenance) < new Date()
                return (
                  <div key={eq.id} className="flex items-center px-5 py-3 gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isOverdue ? 'bg-red-50' : 'bg-orange-50'
                    }`}>
                      <Wrench size={14} className={isOverdue ? 'text-red-500' : 'text-orange-500'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{eq.name}</p>
                      <p className="text-xs text-slate-400">{eq.location ?? '—'}</p>
                    </div>
                    <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                      {isOverdue ? '⚠ ' : ''}{new Date(eq.next_maintenance!).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
          <div className="px-5 py-3 border-t border-slate-50">
            <Link href={`/org/${orgId}/support/infrastructure/new`}
              className="text-xs text-[#1B3A6B] hover:underline font-medium">
              + Ajouter un équipement
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
