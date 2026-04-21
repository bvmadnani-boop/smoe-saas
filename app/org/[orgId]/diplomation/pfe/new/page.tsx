import { createClient } from '@/lib/supabase/server'
import NewPfeForm from '@/components/org/diplomation/NewPfeForm'
import Link from 'next/link'

export default async function NewPfePage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  const [{ data: students }, { data: teachers }] = await Promise.all([
    supabase
      .from('students')
      .select('id, full_name')
      .eq('organization_id', orgId)
      .in('status', ['inscrit', 'actif'])
      .order('full_name'),
    supabase
      .from('teachers')
      .select('id, full_name')
      .eq('organization_id', orgId)
      .order('full_name'),
  ])

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <Link href={`/org/${orgId}/diplomation/pfe`}
          className="text-sm text-slate-400 hover:text-slate-600 mb-2 inline-block">
          ← Retour aux projets PFE
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nouveau projet PFE</h1>
        <p className="text-slate-500 mt-1 text-sm">Enregistrement d'un projet de fin d'études</p>
      </div>
      <NewPfeForm orgId={orgId} students={students ?? []} teachers={teachers ?? []} />
    </div>
  )
}
