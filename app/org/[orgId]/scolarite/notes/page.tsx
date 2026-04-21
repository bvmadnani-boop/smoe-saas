import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BarChart3, Plus, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function NotesPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  const { data: grades } = await supabase
    .from('grades')
    .select(`
      id, grade, exam_type, coefficient, graded_at, notes,
      students(id, full_name, student_code),
      courses(id, name, code)
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  const EXAM_LABELS: Record<string, string> = {
    controle:  'Contrôle',
    examen:    'Examen',
    rattrapage:'Rattrapage',
    tp:        'TP',
    projet:    'Projet',
    oral:      'Oral',
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/org/${orgId}/scolarite`}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-1">
            <ArrowLeft size={13} /> Scolarité
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Notes & Résultats</h1>
          <p className="text-slate-500 mt-0.5 text-sm">{grades?.length ?? 0} note{(grades?.length ?? 0) > 1 ? 's' : ''} saisie{(grades?.length ?? 0) > 1 ? 's' : ''}</p>
        </div>
        <Link href={`/org/${orgId}/scolarite/notes/new`}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white
                     rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
          <Plus size={16} />
          Saisir des notes
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {!grades || grades.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <BarChart3 size={44} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium mb-1">Aucune note saisie</p>
            <Link href={`/org/${orgId}/scolarite/notes/new`}
              className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white
                         rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
              <Plus size={16} /> Saisir les premières notes
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Étudiant</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cours</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Note</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {grades.map(g => (
                <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-slate-800">
                      {(g.students as any)?.full_name ?? '—'}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      {(g.students as any)?.student_code}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-slate-600">{(g.courses as any)?.name ?? '—'}</p>
                    <p className="text-xs text-slate-400">{(g.courses as any)?.code}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">
                      {EXAM_LABELS[g.exam_type] ?? g.exam_type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className={`inline-flex items-center justify-center w-12 h-8 rounded-lg font-bold text-sm ${
                      Number(g.grade) >= 10
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {Number(g.grade).toFixed(2)}
                    </div>
                    {g.coefficient && (
                      <span className="text-xs text-slate-400 ml-2">coef. {g.coefficient}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <p className="text-sm text-slate-500">
                      {g.graded_at ? new Date(g.graded_at).toLocaleDateString('fr-FR') : '—'}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
