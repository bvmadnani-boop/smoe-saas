import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CheckSquare, Plus, ArrowLeft, CheckCircle2, XCircle, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  present:  { label: 'Présent',  cls: 'bg-emerald-50 text-emerald-600' },
  absent:   { label: 'Absent',   cls: 'bg-red-50 text-red-500' },
  retard:   { label: 'Retard',   cls: 'bg-amber-50 text-amber-500' },
  excused:  { label: 'Excusé',   cls: 'bg-blue-50 text-blue-500' },
  justified:{ label: 'Justifié', cls: 'bg-violet-50 text-violet-500' },
}

export default async function PresencesPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  const { data: attendance } = await supabase
    .from('attendance')
    .select(`
      id, date, status, notes,
      students(id, full_name, student_code),
      courses(id, name, code)
    `)
    .eq('organization_id', orgId)
    .order('date', { ascending: false })
    .limit(50)

  // Stats
  const total    = attendance?.length ?? 0
  const presents = attendance?.filter(a => a.status === 'present').length ?? 0
  const absents  = attendance?.filter(a => a.status === 'absent').length  ?? 0
  const retards  = attendance?.filter(a => a.status === 'retard').length  ?? 0
  const tauxPresence = total > 0 ? Math.round((presents / total) * 100) : 0

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/org/${orgId}/scolarite`}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-1">
            <ArrowLeft size={13} /> Scolarité
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Présences</h1>
          <p className="text-slate-500 mt-0.5 text-sm">Suivi des absences et présences</p>
        </div>
        <Link href={`/org/${orgId}/scolarite/presences/new`}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white
                     rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
          <Plus size={16} /> Saisir une présence
        </Link>
      </div>

      {/* Stats */}
      {total > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Taux de présence', value: `${tauxPresence}%`, cls: 'text-emerald-600' },
            { label: 'Présents',  value: presents, cls: 'text-emerald-600' },
            { label: 'Absents',   value: absents,  cls: 'text-red-500' },
            { label: 'Retards',   value: retards,  cls: 'text-amber-500' },
          ].map(({ label, value, cls }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className={`text-2xl font-bold ${cls}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Liste */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {!attendance || attendance.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <CheckSquare size={44} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium mb-1">Aucune présence enregistrée</p>
            <Link href={`/org/${orgId}/scolarite/presences/new`}
              className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white
                         rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
              <Plus size={16} /> Commencer le suivi
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Étudiant</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Cours</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Remarque</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {attendance.map(a => {
                const st = STATUS_MAP[a.status] ?? { label: a.status, cls: 'bg-slate-100 text-slate-500' }
                return (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-slate-800">
                        {(a.students as any)?.full_name ?? '—'}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">
                        {(a.students as any)?.student_code}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-sm text-slate-600">{(a.courses as any)?.name ?? '—'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-slate-600">
                        {a.date ? new Date(a.date).toLocaleDateString('fr-FR') : '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <p className="text-sm text-slate-400 truncate max-w-xs">{a.notes ?? '—'}</p>
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
