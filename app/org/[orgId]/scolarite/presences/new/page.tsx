import { createClient } from '@/lib/supabase/server'
import NewAttendanceForm from '@/components/org/scolarite/NewAttendanceForm'
import Link from 'next/link'

export default async function NewAttendancePage({
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
      .in('status', ['actif', 'inscrit'])
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
        <Link href={`/org/${orgId}/scolarite/presences`}
          className="text-sm text-slate-400 hover:text-slate-600 mb-2 inline-block">
          ← Retour aux présences
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Saisir une présence</h1>
        <p className="text-slate-500 mt-1 text-sm">Enregistrer la présence d'un étudiant</p>
      </div>
      <NewAttendanceForm orgId={orgId} students={students ?? []} courses={courses ?? []} />
    </div>
  )
}
