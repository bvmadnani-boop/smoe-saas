import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ShieldCheck, Plus, ArrowLeft, AlertTriangle } from 'lucide-react'
import {
  NC_CATEGORY_META, NC_SEVERITY_META, NC_STATUS_META,
  type NcCategory,
} from '@/lib/nc-ocap-templates'

export const dynamic = 'force-dynamic'

export default async function NcListPage({
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
    .from('nonconformities')
    .select('id, reference, title, category, severity, source, status, detected_at, ocap_deadline, ocap_responsible, version, created_at')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  if (status && status !== 'all')     query = query.eq('status', status)
  if (category && category !== 'all') query = query.eq('category', category)

  const { data: ncs } = await query

  // Compteurs par statut
  const { data: allNcs } = await supabase
    .from('nonconformities')
    .select('status, severity')
    .eq('organization_id', orgId)

  const counts = {
    ouverte:  allNcs?.filter(n => n.status === 'ouverte').length  ?? 0,
    en_cours: allNcs?.filter(n => n.status === 'en_cours').length ?? 0,
    cloturee: allNcs?.filter(n => n.status === 'cloturee').length ?? 0,
    majeures: allNcs?.filter(n => n.severity === 'majeure' && n.status !== 'cloturee').length ?? 0,
  }

  const statusTabs = [
    { key: 'all',      label: 'Toutes' },
    { key: 'ouverte',  label: 'Ouvertes' },
    { key: 'en_cours', label: 'En cours' },
    { key: 'cloturee', label: 'Clôturées' },
    { key: 'rejetee',  label: 'Rejetées' },
  ]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/org/${orgId}/qualite`}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-1">
            <ArrowLeft size={13} /> Qualité ISO
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Non-Conformités</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            Suivi OCAP — ISO 21001 §10.2
          </p>
        </div>
        <Link href={`/org/${orgId}/qualite/non-conformites/new`}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white
                     rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
          <Plus size={16} /> Ouvrir une NC
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'NC Ouvertes',    value: counts.ouverte,  color: 'bg-red-50   border-red-100',     text: 'text-red-600' },
          { label: 'En cours',       value: counts.en_cours, color: 'bg-amber-50 border-amber-100',   text: 'text-amber-600' },
          { label: 'Clôturées',     value: counts.cloturee, color: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600' },
          { label: 'Majeures actives', value: counts.majeures, color: 'bg-red-50 border-red-200',    text: 'text-red-700' },
        ].map(k => (
          <div key={k.label} className={`rounded-xl border p-4 ${k.color}`}>
            <p className={`text-2xl font-bold ${k.text}`}>{k.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Alerte majeures */}
      {counts.majeures > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-5">
          <AlertTriangle size={16} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">
            <strong>{counts.majeures} NC majeure{counts.majeures > 1 ? 's' : ''}</strong> active{counts.majeures > 1 ? 's' : ''} — traitement prioritaire requis
          </p>
        </div>
      )}

      {/* Filtres statut */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {statusTabs.map(t => (
          <Link key={t.key}
            href={`/org/${orgId}/qualite/non-conformites?status=${t.key}${category ? `&category=${category}` : ''}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              (status ?? 'all') === t.key
                ? 'bg-[#1B3A6B] text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-[#1B3A6B]'
            }`}
          >
            {t.label}
          </Link>
        ))}
        <span className="text-slate-300 text-xs mx-1">|</span>
        {(Object.entries(NC_CATEGORY_META) as [NcCategory, any][]).map(([key, meta]) => (
          <Link key={key}
            href={`/org/${orgId}/qualite/non-conformites?category=${key}${status ? `&status=${status}` : ''}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              category === key
                ? meta.badgeCls
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            {meta.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {!ncs || ncs.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <ShieldCheck size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium mb-1">Aucune non-conformité</p>
            <p className="text-slate-400 text-sm mb-6">Bonne nouvelle — ou créez la première NC.</p>
            <Link href={`/org/${orgId}/qualite/non-conformites/new`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white
                         rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
              <Plus size={16} /> Ouvrir une NC
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Titre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Catégorie</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Gravité</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Détectée</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Délai OCAP</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Version</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ncs.map(nc => {
                const catMeta = NC_CATEGORY_META[nc.category as NcCategory]
                const sevMeta = NC_SEVERITY_META[nc.severity as keyof typeof NC_SEVERITY_META]
                const stMeta  = NC_STATUS_META[nc.status as keyof typeof NC_STATUS_META]
                const isOverdue = nc.ocap_deadline && new Date(nc.ocap_deadline) < new Date() && nc.status !== 'cloturee'
                return (
                  <tr key={nc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link href={`/org/${orgId}/qualite/non-conformites/${nc.id}`}
                        className="text-[#1B3A6B] hover:underline font-medium line-clamp-1 max-w-[280px] block">
                        {nc.title}
                      </Link>
                      {nc.ocap_responsible && (
                        <p className="text-xs text-slate-400 mt-0.5">👤 {nc.ocap_responsible}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${catMeta?.badgeCls ?? ''}`}>
                        {catMeta?.label ?? nc.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${sevMeta?.cls ?? ''}`}>
                        {sevMeta?.label ?? nc.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs">
                      {nc.detected_at
                        ? new Date(nc.detected_at).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      {nc.ocap_deadline ? (
                        <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                          {isOverdue ? '⚠ ' : ''}{new Date(nc.ocap_deadline).toLocaleDateString('fr-FR')}
                        </span>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                        v{nc.version}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stMeta?.cls ?? ''}`}>
                        {stMeta?.label ?? nc.status}
                      </span>
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
