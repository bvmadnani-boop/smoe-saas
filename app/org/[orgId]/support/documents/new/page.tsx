import NewDocumentForm from '@/components/org/support/NewDocumentForm'
import Link from 'next/link'

export default async function NewDocumentPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href={`/org/${orgId}/support/documents`}
          className="text-sm text-slate-400 hover:text-slate-600 mb-2 inline-block">
          ← Retour informations documentées
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nouveau document</h1>
        <p className="text-slate-500 mt-1 text-sm">ISO 21001 §7.5</p>
      </div>
      <NewDocumentForm orgId={orgId} />
    </div>
  )
}
