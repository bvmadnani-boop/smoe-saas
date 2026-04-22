import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  LayoutDashboard, FileText, ShieldCheck, TrendingUp,
  AlertTriangle, CheckCircle2, Users, BarChart3,
  ChevronRight, Plus,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ManagementPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  const [
    { data: swot },
    { data: pestel },
    { data: parties },
    { data: policy },
    { data: risks },
  ] = await Promise.all([
    supabase.from('swot_items').select('id, quadrant, is_active').eq('organization_id', orgId),
    supabase.from('pestel_items').select('id, dimension, is_active').eq('organization_id', orgId),
    supabase.from('interested_parties').select('id, group_key, is_active').eq('organization_id', orgId),
    supabase.from('quality_policies').select('id, title, version, status, approver_name, approved_at, review_date')
      .eq('organization_id', orgId).eq('status', 'active').single(),
    supabase.from('risks').select('id, type, score, status').eq('organization_id', orgId).eq('is_active', true),
  ])

  const swotActive     = swot?.filter(s => s.is_active) ?? []
  const pestelActive   = pestel?.filter(p => p.is_active) ?? []
  const partiesActive  = parties?.filter(p => p.is_active) ?? []
  const risksAll       = risks ?? []

  const forces      = swotActive.filter(s => s.quadrant === 'forces').length
  const faiblesses  = swotActive.filter(s => s.quadrant === 'faiblesses').length
  const opps        = swotActive.filter(s => s.quadrant === 'opportunites').length
  const menaces     = swotActive.filter(s => s.quadrant === 'menaces').length

  const critiques   = risksAll.filter(r => r.score >= 20 && r.type === 'risque' && r.status !== 'clos').length
  const eleves      = risksAll.filter(r => r.score >= 12 && r.score < 20 && r.type === 'risque' && r.status !== 'clos').length
  const nbOpps      = risksAll.filter(r => r.type === 'opportunite').length

  const policyOverdue = policy?.review_date && new Date(policy.review_date) < new Date()

  const modules = [
    {
      href:    `/org/${orgId}/management/contexte`,
      label:   'Contexte de l\'organisme',
      ref:     '§4',
      icon:    BarChart3,
      iconCls: 'bg-blue-100 text-blue-600',
      desc:    'SWOT · PESTEL · Parties intéressées',
      status:  swotActive.length > 0 ? 'ok' : 'empty',
      stats:   swotActive.length > 0
        ? `${swotActive.length} items SWOT · ${pestelActive.length} PESTEL · ${partiesActive.length} PI`
        : 'Non renseigné',
    },
    {
      href:    `/org/${orgId}/management/politique`,
      label:   'Politique qualité',
      ref:     '§5.2',
      icon:    FileText,
      iconCls: 'bg-violet-100 text-violet-600',
      desc:    'Engagement de la direction',
      status:  policy ? 'ok' : 'empty',
      stats:   policy
        ? `v${policy.version} · ${policy.approver_name ?? 'Non approuvée'}${policyOverdue ? ' · ⚠️ Révision en retard' : ''}`
        : 'Aucune politique active',
    },
    {
      href:    `/org/${orgId}/management/risques`,
      label:   'Risques & Opportunités',
      ref:     '§6.1',
      icon:    ShieldCheck,
      iconCls: 'bg-orange-100 text-orange-600',
      desc:    'Registre des risques · Matrice 5×5',
      status:  risksAll.length > 0 ? (critiques > 0 ? 'alert' : 'ok') : 'empty',
      stats:   risksAll.length > 0
        ? `${critiques} critiques · ${eleves} élevés · ${nbOpps} opportunités`
        : 'Registre vide',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Management</h1>
        <p className="text-slate-500 mt-1 text-sm">
          ISO 21001 — Contexte · Politique · Planification stratégique
        </p>
      </div>

      {/* Modules principaux */}
      <div className="grid grid-cols-1 gap-4 mb-8">
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
                {m.status === 'alert' && (
                  <AlertTriangle size={14} className="text-amber-500" />
                )}
                {m.status === 'ok' && (
                  <CheckCircle2 size={14} className="text-emerald-500" />
                )}
              </div>
              <p className="text-xs text-slate-400">{m.desc}</p>
              <p className={`text-xs mt-0.5 font-medium ${
                m.status === 'alert' ? 'text-amber-600'
                : m.status === 'ok'  ? 'text-emerald-600'
                : 'text-slate-400'
              }`}>
                {m.stats}
              </p>
            </div>

            <ChevronRight size={18} className="text-slate-300 group-hover:text-[#1B3A6B] transition-colors shrink-0 ml-4" />
          </Link>
        ))}
      </div>

      {/* Snapshot SWOT */}
      {swotActive.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 text-sm">Analyse SWOT — Vue rapide</h2>
            <Link href={`/org/${orgId}/management/contexte`}
              className="text-xs text-[#1B3A6B] hover:underline font-medium">
              Voir tout →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Forces',       count: forces,     cls: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
              { label: 'Faiblesses',   count: faiblesses, cls: 'bg-red-50     border-red-200     text-red-700' },
              { label: 'Opportunités', count: opps,       cls: 'bg-blue-50    border-blue-200    text-blue-700' },
              { label: 'Menaces',      count: menaces,    cls: 'bg-amber-50   border-amber-200   text-amber-700' },
            ].map(({ label, count, cls }) => (
              <div key={label} className={`rounded-xl border p-4 text-center ${cls}`}>
                <p className="text-3xl font-bold">{count}</p>
                <p className="text-xs font-semibold mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Snapshot Risques */}
      {risksAll.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 text-sm">Risques critiques & élevés</h2>
            <Link href={`/org/${orgId}/management/risques`}
              className="text-xs text-[#1B3A6B] hover:underline font-medium">
              Registre complet →
            </Link>
          </div>
          {critiques === 0 && eleves === 0 ? (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 size={15} />
              Aucun risque critique ou élevé non traité ✓
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Critiques (≥20)', value: critiques, cls: 'bg-red-50    border-red-200    text-red-700' },
                { label: 'Élevés (12-19)',  value: eleves,    cls: 'bg-orange-50 border-orange-200 text-orange-700' },
                { label: 'Opportunités',    value: nbOpps,    cls: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
              ].map(({ label, value, cls }) => (
                <div key={label} className={`rounded-xl border p-4 text-center ${cls}`}>
                  <p className="text-3xl font-bold">{value}</p>
                  <p className="text-xs font-semibold mt-1">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
