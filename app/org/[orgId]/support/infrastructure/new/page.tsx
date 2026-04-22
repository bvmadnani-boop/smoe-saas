import NewEquipmentForm from '@/components/org/support/NewEquipmentForm'
import Link from 'next/link'

export default async function NewEquipmentPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href={`/org/${orgId}/support/infrastructure`}
          className="text-sm text-slate-400 hover:text-slate-600 mb-2 inline-block">
          ← Retour infrastructure
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nouvel équipement</h1>
        <p className="text-slate-500 mt-1 text-sm">ISO 21001 §7.1.3 · §7.1.4</p>
      </div>
      <NewEquipmentForm orgId={orgId} />
    </div>
  )
}
