import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FolderOpen, Plus, ArrowLeft, AlertTriangle } from 'lucide-react'
import {
  DOCUMENT_STATUS_META, DOCUMENT_TYPE_META,
  type DocumentStatus, type DocumentType,
} from '@/lib/support-templates'

export const dynamic = 'force-dynamic'

export default async function DocumentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>
  searchParams: Promise<{ status?: string; type?: string }>
}) {
  const { orgId }         = await params
  const { status, type }  = await searchParams
  const supabase          = await createClient()

  let query = supabase
    .from('support_documents')
    .select('id, reference, title, document_type, version, status, owner, review_date, created_at')
    .eq('organization_id', orgId)
    .order('title')

  if (status) query = query.eq('status', status)
  if (type)   query = query.eq('document_type', type)

  const { data: documents } = await query

  const { data: all } = await supabase
    .from('support_documents')
    .select('status, document_type, review_date')
    .eq('organization_id', orgId)

  const total     = all?.length ?? 0
  const actifs    = all?.filter(d => d.status === 'actif').length ?? 0
  const expires   = all?.filter(d => d.review_date && new Date(d.review_date) < new Date() && d.status !== 'archive').length ?? 0
  const revision  = all?.filter(d => d.status === 'en_revision').length ?? 0

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/org/${orgId}/support`}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-1">
            <ArrowLeft size={13} /> Support §7
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Informations documentées</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            ISO 21001 §7.5 — Procédures · Instructions · Formulaires · Enregistrements
          </p>
        </div>
        <Link href={`/org/${orgId}/support/documents/new`}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white
                     rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
          <Plus size={16} /> Nouveau document
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total',        value: total,    cls: 'border-slate-200',   iconCls: 'bg-slate-100  text-slate-500'   },
          { label: 'Actifs',       value: actifs,   cls: 'border-emerald-100', iconCls: 'bg-emerald-50 text-emerald-600' },
          { label: 'En révision',  value: revision, cls: 'border-amber-100',   iconCls: 'bg-amber-50   text-amber-600'   },
          { label: 'Révision dépassée', value: expires, cls: expires > 0 ? 'border-red-200' : 'border-slate-200',
            iconCls: expires > 0 ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400' },
        ].map(({ label, value, cls, iconCls }) => (
          <div key={label} className={`bg-white rounded-xl border ${cls} p-5 flex items-center gap-4`}>
            <div className={`w-11 h-11 rounded-xl ${iconCls} flex items-center justify-center shrink-0`}>
              <FolderOpen size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alerte */}
      {expires > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-5">
          <AlertTriangle size={16} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">
            <strong>{expires} document{expires > 1 ? 's' : ''}</strong> avec date de révision dépassée — mise à jour requise
          </p>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { key: '',           label: 'Tous',        count: total },
          { key: 'actif',      label: 'Actifs',      count: actifs },
          { key: 'en_revision',label: 'En révision', count: revision },
          { key: 'archive',    label: 'Archivés',    count: all?.filter(d => d.status === 'archive').length ?? 0 },
        ].map(({ key, label, count }) => (
          <Link key={key}
            href={`/org/${orgId}/support/documents${key ? `?status=${key}` : ''}`}
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
        <span className="text-slate-200 text-xs mx-1 self-center">|</span>
        {(Object.entries(DOCUMENT_TYPE_META) as [DocumentType, any][]).map(([key, meta]) => (
          <Link key={key}
            href={`/org/${orgId}/support/documents?type=${key}${status ? `&status=${status}` : ''}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              type === key
                ? 'bg-[#1B3A6B] text-white'
                : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'
            }`}>
            {meta.icon} {meta.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {!documents || documents.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <FolderOpen size={44} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium mb-1">Aucun document</p>
            <p className="text-slate-400 text-sm mb-5">
              {status || type ? 'Aucun résultat.' : 'Centralisez vos procédures et documents qualité.'}
            </p>
            {!status && !type && (
              <Link href={`/org/${orgId}/support/documents/new`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white
                           rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
                <Plus size={16} /> Créer le premier document
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Document</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Responsable</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden xl:table-cell">Révision</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {documents.map(doc => {
                const stMeta  = DOCUMENT_STATUS_META[doc.status as DocumentStatus]
                  ?? { label: doc.status, cls: 'bg-slate-100 text-slate-500 border-slate-200' }
                const typeMeta = DOCUMENT_TYPE_META[doc.document_type as DocumentType]
                const isOverdue = doc.review_date && new Date(doc.review_date) < new Date() && doc.status !== 'archive'
                return (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-slate-800">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {doc.reference && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {doc.reference}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">v{doc.version}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-sm text-slate-600">
                      {typeMeta?.icon} {typeMeta?.label ?? doc.document_type}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 hidden lg:table-cell">
                      {doc.owner ?? '—'}
                    </td>
                    <td className="px-4 py-3.5 hidden xl:table-cell">
                      {doc.review_date ? (
                        <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                          {isOverdue ? '⚠ ' : ''}{new Date(doc.review_date).toLocaleDateString('fr-FR')}
                        </span>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${stMeta.cls}`}>
                        {stMeta.label}
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
