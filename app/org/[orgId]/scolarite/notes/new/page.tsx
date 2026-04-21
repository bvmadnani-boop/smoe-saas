import { createClient } from '@/lib/supabase/server'
import NewGradeForm from '@/components/org/scolarite/NewGradeForm'
import Link from 'next/link'

export default async function NewGradePage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  const [{ data: students }, { data: courses }] = await Promise.all([
    supabase
      .from('students')
      .select('id, full_name, student_code')
      .eq('organization_id', orgId)
      .eq('status', 'actif')
      .order('full_name'),
    supabase
      .from('courses')
      .select('id, name, code')
      .eq('organization_id', orgId)
      .order('name'),
  ])

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <Link href={`/org/${orgId}/scolarite/notes`}
          className="text-sm text-slate-400 hover:text-slate-600 mb-2 inline-block">
          ← Retour aux notes
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Saisir une note</h1>
        <p className="text-slate-500 mt-1 text-sm">Enregistrer le résultat d'un étudiant</p>
      </div>
      <NewGradeForm orgId={orgId} students={students ?? []} courses={courses ?? []} />
    </div>
  )
}
