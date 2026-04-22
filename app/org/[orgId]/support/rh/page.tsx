import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Users, Plus, ArrowLeft, CheckCircle2, AlertTriangle,
} from 'lucide-react'
import {
  PERSONNEL_STATUS_META, CONTRACT_META,
  type PersonnelStatus, type PersonnelContract,
} from '@/lib/support-templates'

export const dynamic = 'force-dynamic'

export default async function RhPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>
  searchParams: Promise<{ status?: string; contract?: string }>
}) {
  const { orgId }              = await params
  const { status, contract }   = await searchParams
  const supabase               = await createClient()

  let query = supabase
    .from('support_personnel')
    .select('id, full_name, role, contract_type, status, start_date, sensibilisation_done, competences, email, phone')
    .eq('organization_id', orgId)
    .order('full_name')

  if (status)   query = query.eq('status', status)
  if (contract) query = query.eq('contract_type', contract)

  const { data: personnel } = await query

  const { data: all } = await supabase
    .from('support_personnel')
    .select('status, contract_type, sensibilisation_done')
    .eq('organization_id', orgId)

  const total              = all?.length ?? 0
  const actifs             = all?.filter(p => p.status === 'actif').length ?? 0
  const sansSensibilisation = all?.filter(p => !p.sensibilisation_done && p.status === 'actif').length ?? 0

  const byContract = (all ?? []).reduce((acc: Record<string, number>, p) => {
    acc[p.contract_type] = (acc[p.contract_type] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/org/${orgId}/support`}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-1">
            <ArrowLeft size={13} /> Support §7
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Ressources humaines</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            ISO 21001 §7.1.2 · §7.2 Compétence · §7.3 Sensibilisation
          </p>
        </div>
        <Link href={`/org/${orgId}/support/rh/new`}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white
                     rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
          <Plus size={16} /> Ajouter un membre
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total personnel',         value: total,               cls: 'border-slate-200',   iconCls: 'bg-slate-100 text-slate-500'     },
          { label: 'Actifs',                   value: actifs,              cls: 'border-emerald-100', iconCls: 'bg-emerald-50 text-emerald-600'   },
          { label: 'Sensibilisation manquante',value: sansSensibilisation, cls: sansSensibilisation > 0 ? 'border-amber-200' : 'border-slate-200',
            iconCls: sansSensibilisation > 0 ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-400' },
        ].map(({ label, value, cls, iconCls }) => (
          <div key={label} className={`bg-white rounded-xl border ${cls} p-5 flex items-center gap-4`}>
            <div className={`w-11 h-11 rounded-xl ${iconCls} flex items-center justify-center shrink-0`}>
              <Users size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alerte sensibilisation */}
      {sansSensibilisation > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-5">
          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">
            <strong>{sansSensibilisation} membre{sansSensibilisation > 1 ? 's' : ''}</strong> n'ont pas complété leur sensibilisation ISO 21001 §7.3
          </p>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { key: '', label: 'Tous', count: total },
          { key: 'actif',   label: 'Actifs',   count: actifs },
          { key: 'inactif', label: 'Inactifs', count: all?.filter(p => p.status === 'inactif').length ?? 0 },
          { key: 'conge',   label: 'En congé', count: all?.filter(p => p.status === 'conge').length ?? 0 },
          { key: 'essai',   label: "Essai",    count: all?.filter(p => p.status === 'essai').length ?? 0 },
        ].map(({ key, label, count }) => (
          <Link key={key}
            href={`/org/${orgId}/support/rh${key ? `?status=${key}` : ''}`}
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {!personnel || personnel.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Users size={44} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium mb-1">Aucun membre du personnel</p>
            <p className="text-slate-400 text-sm mb-5">
              {status ? 'Aucun résultat pour ce filtre.' : 'Commencez par enregistrer votre équipe.'}
            </p>
            {!status && (
              <Link href={`/org/${orgId}/support/rh/new`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white
                           rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
                <Plus size={16} /> Ajouter le premier membre
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Membre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Contrat</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Entrée</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden xl:table-cell">§7.3 Sensib.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {personnel.map(p => {
                const stMeta = PERSONNEL_STATUS_META[p.status as PersonnelStatus]
                  ?? { label: p.status, cls: 'bg-slate-100 text-slate-500 border-slate-200' }
                const ctMeta = CONTRACT_META[p.contract_type as PersonnelContract]
                  ?? { label: p.contract_type, cls: 'bg-slate-100 text-slate-500 border-slate-200' }
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1B3A6B]/10 flex items-center justify-center shrink-0">
                          <span className="text-[#1B3A6B] text-xs font-bold">
                            {p.full_name?.split(' ').map((n: string) => n[0]).slice(0,2).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{p.full_name}</p>
                          <p className="text-xs text-slate-400">{p.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium ${ctMeta.cls}`}>
                        {ctMeta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 hidden lg:table-cell">
                      {p.start_date ? new Date(p.start_date).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${stMeta.cls}`}>
                        {stMeta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden xl:table-cell">
                      {p.sensibilisation_done
                        ? <CheckCircle2 size={15} className="text-emerald-500" />
                        : <span className="text-xs text-amber-500 font-medium">À faire</span>
                      }
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
