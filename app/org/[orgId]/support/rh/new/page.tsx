import NewPersonnelForm from '@/components/org/support/NewPersonnelForm'
import Link from 'next/link'

export default async function NewPersonnelPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href={`/org/${orgId}/support/rh`}
          className="text-sm text-slate-400 hover:text-slate-600 mb-2 inline-block">
          ← Retour RH
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nouveau membre du personnel</h1>
        <p className="text-slate-500 mt-1 text-sm">ISO 21001 §7.1.2 · §7.2 · §7.3</p>
      </div>
      <NewPersonnelForm orgId={orgId} />
    </div>
  )
}
