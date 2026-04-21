import { createClient } from '@/lib/supabase/server'
import NewScheduleForm from '@/components/org/scolarite/NewScheduleForm'
import Link from 'next/link'

export default async function NewSchedulePage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  const [{ data: courses }, { data: teachers }] = await Promise.all([
    supabase.from('courses').select('id, name, code').eq('organization_id', orgId).order('name'),
    supabase.from('teachers').select('id, full_name').eq('organization_id', orgId).order('full_name'),
  ])

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <Link href={`/org/${orgId}/scolarite/emploi-du-temps`}
          className="text-sm text-slate-400 hover:text-slate-600 mb-2 inline-block">
          ← Retour à l'emploi du temps
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nouvelle séance</h1>
        <p className="text-slate-500 mt-1 text-sm">Ajouter une séance au planning hebdomadaire</p>
      </div>
      <NewScheduleForm orgId={orgId} courses={courses ?? []} teachers={teachers ?? []} />
    </div>
  )
}
