import { createClient } from '@/lib/supabase/server'
import NewCourseForm from '@/components/org/scolarite/NewCourseForm'
import Link from 'next/link'

export default async function NewCoursePage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  const { data: filieres } = await supabase
    .from('filieres')
    .select('id, name')
    .eq('organization_id', orgId)
    .order('name')

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <Link href={`/org/${orgId}/scolarite/cours`}
          className="text-sm text-slate-400 hover:text-slate-600 mb-2 inline-block">
          ← Retour aux cours
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nouveau cours</h1>
        <p className="text-slate-500 mt-1 text-sm">Ajouter un cours au programme</p>
      </div>
      <NewCourseForm orgId={orgId} filieres={filieres ?? []} />
    </div>
  )
}
