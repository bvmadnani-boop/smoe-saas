import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BookOpen, Plus, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CoursPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select(`id, name, code, credits, hours_total, semester, level, filieres(name)`)
    .eq('organization_id', orgId)
    .order('semester', { ascending: true })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/org/${orgId}/scolarite`}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-1">
            <ArrowLeft size={13} /> Scolarité
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Cours & Matières</h1>
          <p className="text-slate-500 mt-0.5 text-sm">{courses?.length ?? 0} cours</p>
        </div>
        <Link href={`/org/${orgId}/scolarite/cours/new`}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white
                     rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
          <Plus size={16} /> Nouveau cours
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {!courses || courses.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <BookOpen size={44} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium mb-1">Aucun cours</p>
            <Link href={`/org/${orgId}/scolarite/cours/new`}
              className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white
                         rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
              <Plus size={16} /> Créer le premier cours
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cours</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Filière</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Semestre</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Crédits</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Heures</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {courses.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-slate-800">{c.name}</p>
                    {c.code && <p className="text-xs text-slate-400 font-mono">{c.code}</p>}
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <p className="text-sm text-slate-600">{(c.filieres as any)?.name ?? '—'}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    {c.semester && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
                        S{c.semester}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <p className="text-sm text-slate-600">{c.credits ?? '—'}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <p className="text-sm text-slate-600">{c.hours_total ? `${c.hours_total}h` : '—'}</p>
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
