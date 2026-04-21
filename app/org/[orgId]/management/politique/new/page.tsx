import Link from 'next/link'
import PolicyEditor from '@/components/org/qualite/PolicyEditor'

export default async function NewPolitiquePage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href={`/org/${orgId}/management/politique`}
          className="text-sm text-slate-400 hover:text-slate-600 mb-2 inline-block">
          ← Retour à la politique qualité
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nouvelle politique qualité</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Sélectionnez un modèle — le texte se pré-remplit automatiquement
        </p>
      </div>
      <PolicyEditor orgId={orgId} mode="new" />
    </div>
  )
}
