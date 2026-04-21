import { createClient } from '@/lib/supabase/server'
import NewDiplomaForm from '@/components/org/diplomation/NewDiplomaForm'
import Link from 'next/link'

export default async function NewDiplomaPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  const [{ data: students }, { data: filieres }, { data: pfes }] = await Promise.all([
    supabase
      .from('students')
      .select('id, full_name')
      .eq('organization_id', orgId)
      .order('full_name'),
    supabase
      .from('filieres')
      .select('id, name, code')
      .eq('organization_id', orgId)
      .order('name'),
    supabase
      .from('pfe_projects')
      .select('id, title, student_id')
      .eq('organization_id', orgId)
      .in('status', ['validated', 'defended'])
      .order('title'),
  ])

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <Link href={`/org/${orgId}/diplomation/diplomes`}
          className="text-sm text-slate-400 hover:text-slate-600 mb-2 inline-block">
          ← Retour aux diplômes
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nouveau diplôme</h1>
        <p className="text-slate-500 mt-1 text-sm">Création et soumission pour approbation SUP2I</p>
      </div>
      <NewDiplomaForm
        orgId={orgId}
        students={students ?? []}
        filieres={filieres ?? []}
        pfes={pfes ?? []}
      />
    </div>
  )
}
