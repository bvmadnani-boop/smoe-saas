import { createClient } from '@/lib/supabase/server'
import NewStudentForm from '@/components/org/inscription/NewStudentForm'
import Link from 'next/link'

export default async function NewStudentPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  const { data: filieres } = await supabase
    .from('filieres')
    .select('id, name, code')
    .eq('organization_id', orgId)
    .eq('is_active', true)
    .order('name')

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link
          href={`/org/${orgId}/inscription`}
          className="text-sm text-slate-400 hover:text-slate-600 mb-2 inline-block"
        >
          ← Retour aux inscriptions
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nouvel étudiant</h1>
        <p className="text-slate-500 mt-1 text-sm">Dossier d'inscription SUP2I</p>
      </div>

      <NewStudentForm orgId={orgId} filieres={filieres ?? []} />
    </div>
  )
}
