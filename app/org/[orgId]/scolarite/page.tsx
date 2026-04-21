import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  BookOpen, Users, CheckSquare, BarChart3,
  GraduationCap, ChevronRight, Plus,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ScolaritePage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  const [
    { count: nbCours },
    { count: nbTeachers },
    { count: nbGrades },
    { data: recentGrades },
    { data: teachers },
  ] = await Promise.all([
    supabase.from('courses').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase.from('grades').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase
      .from('grades')
      .select('id, grade, exam_type, graded_at, students(full_name), courses(name)')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('teachers')
      .select('id, full_name, speciality, status, sup2i_validated')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const modules: Array<{href:string;label:string;desc:string;icon:any;count:number|null;color:string}> = [
    {
      href:  `/org/${orgId}/scolarite/emploi-du-temps`,
      label: 'Emploi du temps',
      desc:  'Planning hebdomadaire des séances',
      icon:  GraduationCap,
      count: null,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      href:  `/org/${orgId}/scolarite/cours`,
      label: 'Cours & Matières',
      desc:  'Gestion des cours par filière',
      icon:  BookOpen,
      count: nbCours ?? 0,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      href:  `/org/${orgId}/scolarite/enseignants`,
      label: 'Enseignants',
      desc:  'Corps professoral & validation SUP2I',
      icon:  Users,
      count: nbTeachers ?? 0,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      href:  `/org/${orgId}/scolarite/notes`,
      label: 'Notes & Résultats',
      desc:  'Saisie et consultation des notes',
      icon:  BarChart3,
      count: nbGrades ?? 0,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      href:  `/org/${orgId}/scolarite/presences`,
      label: 'Présences',
      desc:  'Suivi des absences et présences',
      icon:  CheckSquare,
      count: null,
      color: 'bg-amber-50 text-amber-600',
    },
  ]

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">P4 — Scolarité</h1>
        <p className="text-slate-500 mt-1 text-sm">Suivi pédagogique · cours, notes, présences, enseignants</p>
      </div>

      {/* Modules cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {modules.map(({ href, label, desc, icon: Icon, count, color }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:border-[#1B3A6B]
                       hover:shadow-sm transition-all group"
          >
            <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon size={20} />
            </div>
            <p className="font-semibold text-slate-800 text-sm group-hover:text-[#1B3A6B]">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5 mb-3">{desc}</p>
            <div className="flex items-center justify-between">
              {count !== null && (
                <span className="text-xl font-bold text-slate-900">{count}</span>
              )}
              <ChevronRight size={14} className="text-slate-300 group-hover:text-[#1B3A6B] ml-auto" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Dernières notes */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
              <BarChart3 size={15} className="text-slate-400" />
              Dernières notes saisies
            </h2>
            <Link href={`/org/${orgId}/scolarite/notes`}
              className="text-xs text-[#1B3A6B] hover:underline font-medium">
              Voir tout →
            </Link>
          </div>
          {!recentGrades || recentGrades.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <BarChart3 size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Aucune note saisie</p>
              <Link href={`/org/${orgId}/scolarite/notes/new`}
                className="mt-2 inline-block text-xs text-[#1B3A6B] hover:underline font-medium">
                + Saisir des notes
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentGrades.map(g => (
                <div key={g.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {(g.students as any)?.full_name ?? '—'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {(g.courses as any)?.name ?? '—'} · {g.exam_type}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    Number(g.grade) >= 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                  }`}>
                    {Number(g.grade).toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enseignants */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
              <Users size={15} className="text-slate-400" />
              Enseignants
            </h2>
            <Link href={`/org/${orgId}/scolarite/enseignants`}
              className="text-xs text-[#1B3A6B] hover:underline font-medium">
              Voir tout →
            </Link>
          </div>
          {!teachers || teachers.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Users size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Aucun enseignant</p>
              <Link href={`/org/${orgId}/scolarite/enseignants/new`}
                className="mt-2 inline-block text-xs text-[#1B3A6B] hover:underline font-medium">
                + Ajouter un enseignant
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {teachers.map(t => (
                <div key={t.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                    <span className="text-purple-600 text-xs font-bold">
                      {t.full_name?.split(' ').map((n: string) => n[0]).slice(0,2).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{t.full_name}</p>
                    <p className="text-xs text-slate-400">{t.speciality ?? '—'}</p>
                  </div>
                  {t.sup2i_validated ? (
                    <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
                      SUP2I ✓
                    </span>
                  ) : (
                    <span className="text-xs bg-amber-50 text-amber-500 px-2 py-0.5 rounded-full font-medium">
                      En attente
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
