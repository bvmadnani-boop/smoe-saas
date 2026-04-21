import NewNcForm from '@/components/org/qualite/NewNcForm'
import Link from 'next/link'

export default async function NewNcPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <Link href={`/org/${orgId}/qualite/non-conformites`}
          className="text-sm text-slate-400 hover:text-slate-600 mb-2 inline-block">
          ← Retour aux non-conformités
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Ouvrir une Non-Conformité</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Sélectionnez une catégorie — l'OCAP se pré-remplit automatiquement
        </p>
      </div>
      <NewNcForm orgId={orgId} />
    </div>
  )
}
