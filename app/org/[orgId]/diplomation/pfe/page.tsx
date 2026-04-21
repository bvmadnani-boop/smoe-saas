import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileText, Plus, ArrowLeft, Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

const PFE_STATUS: Record<string, { label: string; cls: string }> = {
  pending:     { label: 'En attente',  cls: 'bg-slate-100 text-slate-500' },
  in_progress: { label: 'En cours',   cls: 'bg-blue-50 text-blue-600' },
  submitted:   { label: 'Soumis',     cls: 'bg-violet-50 text-violet-600' },
  defended:    { label: 'Soutenu',    cls: 'bg-amber-50 text-amber-600' },
  validated:   { label: 'Validé',     cls: 'bg-emerald-50 text-emerald-600' },
  rejected:    { label: 'Rejeté',     cls: 'bg-red-50 text-red-500' },
}

export default async function PfeListPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>
  searchParams: Promise<{ status?: string }>
}) {
  const { orgId }   = await params
  const { status }  = await searchParams
  const supabase    = await createClient()

  let query = supabase
    .from('pfe_projects')
    .select(`
      id, title, status, defense_date, grade, host_company,
      students(full_name),
      teachers(full_name)
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') query = query.eq('status', status)

  const { data: pfes } = await query

  const tabs = [
    { key: 'all',         label: 'Tous' },
    { key: 'pending',     label: 'En attente' },
    { key: 'in_progress', label: 'En cours' },
    { key: 'submitted',   label: 'Soumis' },
    { key: 'defended',    label: 'Soutenus' },
    { key: 'validated',   label: 'Validés' },
    { key: 'rejected',    label: 'Rejetés' },
  ]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/org/${orgId}/diplomation`}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-1">
            <ArrowLeft size={13} /> Diplomation
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Projets de Fin d'Études</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            {pfes?.length ?? 0} projet{(pfes?.length ?? 0) > 1 ? 's' : ''}
          </p>
        </div>
        <Link href={`/org/${orgId}/diplomation/pfe/new`}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white
                     rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
          <Plus size={16} /> Nouveau PFE
        </Link>
      </div>

      {/* Filtres statut */}
      <div className="flex gap-2 flex-wrap mb-5">
        {tabs.map(t => (
          <Link
            key={t.key}
            href={`/org/${orgId}/diplomation/pfe${t.key !== 'all' ? `?status=${t.key}` : ''}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              (status ?? 'all') === t.key
                ? 'bg-[#1B3A6B] text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-[#1B3A6B]'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {!pfes || pfes.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <FileText size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium mb-1">Aucun projet PFE</p>
            <p className="text-slate-400 text-sm mb-6">Créez le premier projet de fin d'études.</p>
            <Link href={`/org/${orgId}/diplomation/pfe/new`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white
                         rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
              <Plus size={16} /> Nouveau PFE
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Étudiant</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Sujet</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Entreprise</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Encadrant</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Soutenance</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Note</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pfes.map(p => {
                const st = PFE_STATUS[p.status] ?? { label: p.status, cls: 'bg-slate-100 text-slate-500' }
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {(p.students as any)?.full_name ?? '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href={`/org/${orgId}/diplomation/pfe/${p.id}`}
                        className="text-[#1B3A6B] hover:underline font-medium line-clamp-1 max-w-[220px] block">
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{p.host_company ?? '—'}</td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {(p.teachers as any)?.full_name ?? '—'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {p.defense_date
                        ? new Date(p.defense_date).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      {p.grade ? (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          Number(p.grade) >= 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                        }`}>
                          {Number(p.grade).toFixed(1)}/20
                        </span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>
                        {st.label}
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
