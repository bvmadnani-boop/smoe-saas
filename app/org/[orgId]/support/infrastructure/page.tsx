import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Wrench, Plus, ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react'
import {
  EQUIPMENT_STATUS_META, EQUIPMENT_CATEGORY_META,
  type EquipmentStatus, type EquipmentCategory,
} from '@/lib/support-templates'

export const dynamic = 'force-dynamic'

export default async function InfrastructurePage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>
  searchParams: Promise<{ status?: string; category?: string }>
}) {
  const { orgId }             = await params
  const { status, category }  = await searchParams
  const supabase              = await createClient()

  let query = supabase
    .from('support_equipments')
    .select('id, name, category, serial_number, location, status, purchase_date, last_maintenance, next_maintenance, notes')
    .eq('organization_id', orgId)
    .order('name')

  if (status)   query = query.eq('status', status)
  if (category) query = query.eq('category', category)

  const { data: equipments } = await query

  const { data: all } = await supabase
    .from('support_equipments')
    .select('status, category')
    .eq('organization_id', orgId)

  const total         = all?.length ?? 0
  const hsCount       = all?.filter(e => e.status === 'hors_service').length ?? 0
  const maintCount    = all?.filter(e => e.status === 'maintenance').length ?? 0
  const opCount       = all?.filter(e => e.status === 'operationnel').length ?? 0

  const now = new Date()
  const maintenanceProche = (equipments ?? []).filter(e =>
    e.next_maintenance && new Date(e.next_maintenance) < new Date(now.getTime() + 30 * 86400000)
  )

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/org/${orgId}/support`}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-1">
            <ArrowLeft size={13} /> Support §7
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Infrastructure & Équipements</h1>
          <p className="text-slate-500 mt-0.5 text-sm">ISO 21001 §7.1.3 Infrastructure · §7.1.4 Environnement de travail</p>
        </div>
        <Link href={`/org/${orgId}/support/infrastructure/new`}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white
                     rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
          <Plus size={16} /> Ajouter un équipement
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total',           value: total,       cls: 'border-slate-200',   iconCls: 'bg-slate-100  text-slate-500'    },
          { label: 'Opérationnels',   value: opCount,     cls: 'border-emerald-100', iconCls: 'bg-emerald-50 text-emerald-600'  },
          { label: 'Maintenance',     value: maintCount,  cls: 'border-amber-100',   iconCls: 'bg-amber-50   text-amber-600'    },
          { label: 'Hors service',    value: hsCount,     cls: hsCount > 0 ? 'border-red-200' : 'border-slate-200',
            iconCls: hsCount > 0 ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400' },
        ].map(({ label, value, cls, iconCls }) => (
          <div key={label} className={`bg-white rounded-xl border ${cls} p-5 flex items-center gap-4`}>
            <div className={`w-11 h-11 rounded-xl ${iconCls} flex items-center justify-center shrink-0`}>
              <Wrench size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alertes */}
      {hsCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-3">
          <AlertTriangle size={16} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">
            <strong>{hsCount} équipement{hsCount > 1 ? 's' : ''} hors service</strong> — nécessite une intervention
          </p>
        </div>
      )}
      {maintenanceProche.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-5">
          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">
            <strong>{maintenanceProche.length} équipement{maintenanceProche.length > 1 ? 's' : ''}</strong> avec maintenance dans les 30 jours
          </p>
        </div>
      )}

      {/* Filtres statut */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { key: '',              label: 'Tous',          count: total },
          { key: 'operationnel',  label: 'Opérationnels', count: opCount },
          { key: 'maintenance',   label: 'Maintenance',   count: maintCount },
          { key: 'hors_service',  label: 'Hors service',  count: hsCount },
        ].map(({ key, label, count }) => (
          <Link key={key}
            href={`/org/${orgId}/support/infrastructure${key ? `?status=${key}` : ''}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              (status ?? '') === key
                ? 'bg-[#1B3A6B] text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-[#1B3A6B]'
            }`}>
            {label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              (status ?? '') === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>{count}</span>
          </Link>
        ))}

        {/* Filtres catégorie */}
        <span className="text-slate-200 text-xs mx-1 self-center">|</span>
        {(Object.entries(EQUIPMENT_CATEGORY_META) as [EquipmentCategory, any][]).map(([key, meta]) => (
          <Link key={key}
            href={`/org/${orgId}/support/infrastructure?category=${key}${status ? `&status=${status}` : ''}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              category === key
                ? 'bg-[#1B3A6B] text-white'
                : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'
            }`}>
            {meta.icon} {meta.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {!equipments || equipments.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Wrench size={44} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium mb-1">Aucun équipement</p>
            <p className="text-slate-400 text-sm mb-5">
              {status || category ? 'Aucun résultat pour ces filtres.' : 'Commencez par enregistrer votre parc matériel.'}
            </p>
            {!status && !category && (
              <Link href={`/org/${orgId}/support/infrastructure/new`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white
                           rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
                <Plus size={16} /> Ajouter le premier équipement
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Équipement</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Catégorie</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Emplacement</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden xl:table-cell">Prochaine maintenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {equipments.map(eq => {
                const stMeta  = EQUIPMENT_STATUS_META[eq.status as EquipmentStatus]
                  ?? { label: eq.status, cls: 'bg-slate-100 text-slate-500 border-slate-200' }
                const catMeta = EQUIPMENT_CATEGORY_META[eq.category as EquipmentCategory]
                const isOverdue = eq.next_maintenance && new Date(eq.next_maintenance) < new Date()
                return (
                  <tr key={eq.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-slate-800">{eq.name}</p>
                      {eq.serial_number && (
                        <p className="text-xs text-slate-400 font-mono">S/N: {eq.serial_number}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-slate-600">
                        {catMeta?.icon} {catMeta?.label ?? eq.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 hidden lg:table-cell">
                      {eq.location ?? '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${stMeta.cls}`}>
                        {stMeta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden xl:table-cell">
                      {eq.next_maintenance ? (
                        <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                          {isOverdue ? '⚠ ' : ''}{new Date(eq.next_maintenance).toLocaleDateString('fr-FR')}
                        </span>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
