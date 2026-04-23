import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Plus, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import OrgChartSeeder from '@/components/org/support/OrgChartSeeder'
import FicheSeeder    from '@/components/org/support/FicheSeeder'
import { CONTRACT_META, PERSONNEL_STATUS_META, type PersonnelContract, type PersonnelStatus } from '@/lib/support-templates'

export const dynamic = 'force-dynamic'

const LEVEL_LABEL: Record<number, string> = {
  1: 'Direction',
  2: 'Responsables',
  3: 'Chargés & Agents',
}
const LEVEL_COLOR: Record<number, string> = {
  1: 'bg-[#1B3A6B] text-white',
  2: 'bg-blue-600 text-white',
  3: 'bg-slate-500 text-white',
}

export default async function RhPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  const { data: positions } = await supabase
    .from('org_positions')
    .select(`
      id, title, level, parent_id, order_index,
      org_fiches_fonction ( id ),
      support_personnel ( id, full_name, status, contract_type )
    `)
    .eq('organization_id', orgId)
    .eq('is_active', true)
    .order('level')
    .order('order_index')

  const posMap = Object.fromEntries((positions ?? []).map(p => [p.id, p]))

  const l1 = (positions ?? []).filter(p => p.level === 1)
  const l2 = (positions ?? []).filter(p => p.level === 2)
  const l3 = (positions ?? []).filter(p => p.level === 3)

  const isEmpty = !positions || positions.length === 0

  const totalPostes   = positions?.length ?? 0
  const totalVacants  = (positions ?? []).filter(p => {
    const pers = (p.support_personnel as any[]) ?? []
    return !pers.find((x: any) => x.status === 'actif')
  }).length
  const sansFiche = (positions ?? []).filter(p => {
    const ff = (p.org_fiches_fonction as any[]) ?? []
    return ff.length === 0
  }).length

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
        {!isEmpty && (
          <Link href={`/org/${orgId}/support/rh/poste/new`}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white
                       rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
            <Plus size={16} /> Ajouter un poste
          </Link>
        )}
      </div>

      {/* KPIs */}
      {!isEmpty && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total postes',     value: totalPostes,  cls: 'border-slate-200',   iconCls: 'bg-slate-100 text-slate-500'     },
            { label: 'Postes vacants',   value: totalVacants, cls: totalVacants > 0 ? 'border-amber-200' : 'border-slate-200',
              iconCls: totalVacants > 0 ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-400' },
            { label: 'Sans fiche',       value: sansFiche,    cls: sansFiche > 0 ? 'border-amber-200' : 'border-emerald-100',
              iconCls: sansFiche > 0 ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500' },
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
      )}

      {/* État vide — seeder */}
      {isEmpty ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-16 px-8 text-center max-w-lg mx-auto mt-12">
          <div className="text-5xl mb-4">🏛️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Organigramme vide</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Initialisez avec le modèle ANEAQ (11 postes pré-configurés sur 3 niveaux)
            ou créez vos postes manuellement.
          </p>
          <OrgChartSeeder orgId={orgId} />
          <div className="mt-4">
            <Link href={`/org/${orgId}/support/rh/poste/new`}
              className="text-sm text-slate-400 hover:text-[#1B3A6B] hover:underline">
              ou créer manuellement →
            </Link>
          </div>
        </div>
      ) : (
        <>
        {/* Bandeau fiches manquantes — composant autonome */}
        <FicheSeeder orgId={orgId} />

        {/* Organigramme 3 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[
            { level: 1, list: l1 },
            { level: 2, list: l2 },
            { level: 3, list: l3 },
          ].map(({ level, list }) => (
            <div key={level}>

              {/* Header colonne */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${LEVEL_COLOR[level]}`}>
                    N{level}
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {LEVEL_LABEL[level]}
                  </span>
                  <span className="text-xs text-slate-400">({list.length})</span>
                </div>
                <Link
                  href={`/org/${orgId}/support/rh/poste/new?level=${level}`}
                  className="text-xs text-[#1B3A6B] hover:underline font-medium"
                >
                  + Ajouter
                </Link>
              </div>

              {/* Cartes */}
              <div className="space-y-2">
                {list.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center">
                    <p className="text-xs text-slate-400">Aucun poste à ce niveau</p>
                  </div>
                ) : (
                  list.map(pos => {
                    const personnel = (pos.support_personnel as any[]) ?? []
                    const occupant  = personnel.find((p: any) => p.status === 'actif') ?? null
                    const hasFiche  = ((pos.org_fiches_fonction as any[]) ?? []).length > 0
                    const parent    = pos.parent_id ? posMap[pos.parent_id] : null
                    const ctMeta    = occupant ? CONTRACT_META[occupant.contract_type as PersonnelContract] : null

                    return (
                      <Link
                        key={pos.id}
                        href={`/org/${orgId}/support/rh/poste/${pos.id}`}
                        className="block bg-white rounded-xl border border-slate-200
                                   hover:border-[#1B3A6B]/40 hover:shadow-sm transition-all p-4 group"
                      >
                        {/* Parent label */}
                        {parent && (
                          <p className="text-[10px] text-slate-400 mb-1 truncate">
                            ↳ {parent.title}
                          </p>
                        )}

                        {/* Titre du poste */}
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-[#1B3A6B] leading-tight mb-2">
                          {pos.title}
                        </p>

                        {/* Occupant */}
                        <div className="flex items-center gap-1.5 mb-2">
                          {occupant ? (
                            <>
                              <div className="w-5 h-5 rounded-full bg-[#1B3A6B]/10 flex items-center justify-center shrink-0">
                                <span className="text-[9px] text-[#1B3A6B] font-bold">
                                  {occupant.full_name?.split(' ').map((n: string) => n[0]).slice(0,2).join('')}
                                </span>
                              </div>
                              <span className="text-xs text-slate-700 font-medium truncate">
                                {occupant.full_name}
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                <span className="text-[9px] text-slate-400">?</span>
                              </div>
                              <span className="text-xs text-slate-400 italic">Poste vacant</span>
                            </>
                          )}
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {hasFiche ? (
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200
                                             px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                              <CheckCircle2 size={9} /> Fiche
                            </span>
                          ) : (
                            <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200
                                             px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                              <AlertCircle size={9} /> Sans fiche
                            </span>
                          )}
                          {ctMeta && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${ctMeta.cls}`}>
                              {ctMeta.label}
                            </span>
                          )}
                        </div>
                      </Link>
                    )
                  })
                )}
              </div>
            </div>
          ))}
        </div>
        </>
      )}
    </div>
  )
}
