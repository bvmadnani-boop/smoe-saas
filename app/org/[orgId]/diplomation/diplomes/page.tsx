import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Award, Plus, ArrowLeft, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

const DIPLOMA_STATUS: Record<string, { label: string; cls: string }> = {
  pending:        { label: 'En attente',     cls: 'bg-slate-100 text-slate-500' },
  sup2i_approved: { label: 'Approuvé SUP2I', cls: 'bg-blue-50 text-blue-600' },
  issued:         { label: 'Émis',           cls: 'bg-emerald-50 text-emerald-600' },
  delivered:      { label: 'Remis',          cls: 'bg-violet-50 text-violet-600' },
}

export default async function DiplomesListPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>
  searchParams: Promise<{ status?: string }>
}) {
  const { orgId }  = await params
  const { status } = await searchParams
  const supabase   = await createClient()

  let query = supabase
    .from('diplomas')
    .select(`
      id, diploma_number, status, issue_date, sup2i_approved, sup2i_approved_at, diploma_type,
      students(full_name),
      filieres(name, code)
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') query = query.eq('status', status)

  const { data: diplomas } = await query

  const tabs = [
    { key: 'all',            label: 'Tous' },
    { key: 'pending',        label: 'En attente' },
    { key: 'sup2i_approved', label: 'Approuvés SUP2I' },
    { key: 'issued',         label: 'Émis' },
    { key: 'delivered',      label: 'Remis' },
  ]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/org/${orgId}/diplomation`}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-1">
            <ArrowLeft size={13} /> Diplomation
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Diplômes</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            {diplomas?.length ?? 0} diplôme{(diplomas?.length ?? 0) > 1 ? 's' : ''}
          </p>
        </div>
        <Link href={`/org/${orgId}/diplomation/diplomes/new`}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white
                     rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
          <Plus size={16} /> Nouveau diplôme
        </Link>
      </div>

      {/* Pipeline SUP2I */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { status: 'pending',        label: 'En attente',     color: 'border-slate-200 bg-slate-50' },
          { status: 'sup2i_approved', label: 'Approuvé SUP2I', color: 'border-blue-200 bg-blue-50' },
          { status: 'issued',         label: 'Émis',           color: 'border-emerald-200 bg-emerald-50' },
          { status: 'delivered',      label: 'Remis',          color: 'border-violet-200 bg-violet-50' },
        ].map(pipe => {
          const count = diplomas?.filter(d => d.status === pipe.status).length ?? 0
          return (
            <div key={pipe.status} className={`rounded-xl border p-4 ${pipe.color}`}>
              <p className="text-2xl font-bold text-slate-900">{count}</p>
              <p className="text-xs text-slate-500 mt-0.5">{pipe.label}</p>
            </div>
          )
        })}
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap mb-5">
        {tabs.map(t => (
          <Link
            key={t.key}
            href={`/org/${orgId}/diplomation/diplomes${t.key !== 'all' ? `?status=${t.key}` : ''}`}
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
        {!diplomas || diplomas.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Award size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium mb-1">Aucun diplôme</p>
            <p className="text-slate-400 text-sm mb-6">Créez le premier diplôme.</p>
            <Link href={`/org/${orgId}/diplomation/diplomes/new`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white
                         rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
              <Plus size={16} /> Nouveau diplôme
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Étudiant</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Filière</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">N° Diplôme</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date émission</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">SUP2I</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {diplomas.map(d => {
                const st = DIPLOMA_STATUS[d.status] ?? { label: d.status, cls: 'bg-slate-100 text-slate-500' }
                return (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {(d.students as any)?.full_name ?? '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {(d.filieres as any)?.code ?? '—'}
                      </span>
                      <span className="text-xs text-slate-500 ml-1.5">{(d.filieres as any)?.name}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs">{d.diploma_type ?? '—'}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-700">
                      {d.diploma_number ?? <span className="text-slate-300">En attente</span>}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {d.issue_date
                        ? new Date(d.issue_date).toLocaleDateString('fr-FR')
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      {d.sup2i_approved
                        ? <CheckCircle2 size={16} className="text-emerald-500" />
                        : <span className="w-4 h-4 rounded-full border-2 border-slate-200 inline-block" />}
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
