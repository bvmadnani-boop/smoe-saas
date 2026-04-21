import NewTeacherForm from '@/components/org/scolarite/NewTeacherForm'
import Link from 'next/link'

export default async function NewTeacherPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <Link href={`/org/${orgId}/scolarite/enseignants`}
          className="text-sm text-slate-400 hover:text-slate-600 mb-2 inline-block">
          ← Retour aux enseignants
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nouvel enseignant</h1>
        <p className="text-slate-500 mt-1 text-sm">Ajouter un enseignant au corps professoral</p>
      </div>
      <NewTeacherForm orgId={orgId} />
    </div>
  )
}
