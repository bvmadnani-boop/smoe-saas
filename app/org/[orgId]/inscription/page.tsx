import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  GraduationCap, Plus, Search,
  CheckCircle2, Clock, Award, XCircle,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const STATUS_MAP: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  inscrit:  { label: 'Inscrit',   cls: 'bg-violet-50 text-violet-600',   icon: <Clock size={10} /> },
  actif:    { label: 'Actif',     cls: 'bg-emerald-50 text-emerald-600', icon: <CheckCircle2 size={10} /> },
  diplome:  { label: 'Diplômé',   cls: 'bg-blue-50 text-blue-600',       icon: <Award size={10} /> },
  suspendu: { label: 'Suspendu',  cls: 'bg-red-50 text-red-500',         icon: <XCircle size={10} /> },
  inactif:  { label: 'Inactif',   cls: 'bg-slate-100 text-slate-500',    icon: <Clock size={10} /> },
}

export default async function InscriptionPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const { orgId }  = await params
  const { status, q } = await searchParams
  const supabase   = await createClient()

  let query = supabase
    .from('students')
    .select(`
      id, student_code, full_name,
      email, phone, status, academic_year, created_at,
      filieres(name)
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (q)      query = query.or(`full_name.ilike.%${q}%,student_code.ilike.%${q}%`)

  const { data: students } = await query

  // Compteurs par statut
  const { data: counts } = await supabase
    .from('students')
    .select('status')
    .eq('organization_id', orgId)

  const byStatus = (counts ?? []).reduce((acc: Record<string, number>, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1
    return acc
  }, {})

  const total = counts?.length ?? 0

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">P3 — Inscription</h1>
          <p className="text-slate-500 mt-1 text-sm">Dossiers étudiants · {total} étudiant{total > 1 ? 's' : ''}</p>
        </div>
        <Link
          href={`/org/${orgId}/inscription/new`}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white
                     rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors"
        >
          <Plus size={16} />
          Nouvel étudiant
        </Link>
      </div>

      {/* Filtres statut */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { key: '',          label: 'Tous',      count: total },
          { key: 'inscrit',  label: 'Inscrits',  count: byStatus.inscrit  ?? 0 },
          { key: 'actif',    label: 'Actifs',    count: byStatus.actif    ?? 0 },
          { key: 'diplome',  label: 'Diplômés',  count: byStatus.diplome  ?? 0 },
          { key: 'suspendu', label: 'Suspendus', count: byStatus.suspendu ?? 0 },
        ].map(({ key, label, count }) => (
          <Link
            key={key}
            href={`/org/${orgId}/inscription${key ? `?status=${key}` : ''}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              (status ?? '') === key
                ? 'bg-[#1B3A6B] text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-[#1B3A6B] hover:text-[#1B3A6B]'
            }`}
          >
            {label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              (status ?? '') === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {count}
            </span>
          </Link>
        ))}
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">

        {/* Barre recherche */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <Search size={15} className="text-slate-400 shrink-0" />
          <form method="GET" className="flex-1">
            <input
              name="q"
              defaultValue={q}
              placeholder="Rechercher par nom, prénom ou code étudiant..."
              className="w-full text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent"
            />
          </form>
        </div>

        {!students || students.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <GraduationCap size={44} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium mb-1">Aucun étudiant</p>
            <p className="text-slate-400 text-sm mb-5">
              {q || status ? 'Aucun résultat pour ces filtres.' : 'Inscrivez le premier étudiant pour commencer.'}
            </p>
            {!q && !status && (
              <Link
                href={`/org/${orgId}/inscription/new`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white
                           rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors"
              >
                <Plus size={16} />
                Inscrire le premier étudiant
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Étudiant</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Filière</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Année</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.map((s) => {
                const st = STATUS_MAP[s.status] ?? { label: s.status, cls: 'bg-slate-100 text-slate-500', icon: null }
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1B3A6B]/10 flex items-center justify-center shrink-0">
                          <span className="text-[#1B3A6B] text-xs font-bold">
                            {s.full_name?.split(' ').map((n: string) => n[0]).slice(0,2).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{s.full_name}</p>
                          <p className="text-xs text-slate-400 font-mono">{s.student_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-sm text-slate-600">
                        {(s.filieres as any)?.name ?? '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <p className="text-sm text-slate-600">{s.academic_year ?? '—'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${st.cls}`}>
                        {st.icon}
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/org/${orgId}/inscription/${s.id}`}
                        className="text-xs text-[#1B3A6B] hover:underline font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Voir →
                      </Link>
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
