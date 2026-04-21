import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Plus, CheckCircle2, Clock, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EnseignantsPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  const { data: teachers } = await supabase
    .from('teachers')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/org/${orgId}/scolarite`}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-1">
            <ArrowLeft size={13} /> Scolarité
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Enseignants</h1>
          <p className="text-slate-500 mt-0.5 text-sm">{teachers?.length ?? 0} enseignant{(teachers?.length ?? 0) > 1 ? 's' : ''}</p>
        </div>
        <Link href={`/org/${orgId}/scolarite/enseignants/new`}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white
                     rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
          <Plus size={16} />
          Ajouter un enseignant
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {!teachers || teachers.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <Users size={44} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium mb-1">Aucun enseignant</p>
            <Link href={`/org/${orgId}/scolarite/enseignants/new`}
              className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white
                         rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
              <Plus size={16} /> Ajouter le premier enseignant
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Enseignant</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Spécialité</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Contact</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Validation SUP2I</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {teachers.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                        <span className="text-purple-600 text-xs font-bold">
                          {t.full_name?.split(' ').map((n: string) => n[0]).slice(0,2).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{t.full_name}</p>
                        <p className="text-xs text-slate-400">{t.diploma ?? '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <p className="text-sm text-slate-600">{t.speciality ?? '—'}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <p className="text-sm text-slate-600">{t.email ?? '—'}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    {t.sup2i_validated ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
                        <CheckCircle2 size={10} /> Validé SUP2I
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full font-medium">
                        <Clock size={10} /> En attente
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/org/${orgId}/scolarite/enseignants/${t.id}`}
                      className="text-xs text-[#1B3A6B] hover:underline font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Voir →
                    </Link>
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
