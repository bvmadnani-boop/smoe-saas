import { createClient } from '@/lib/supabase/server'
import NewPositionForm from '@/components/org/support/NewPositionForm'
import Link from 'next/link'

export default async function NewPositionPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>
  searchParams: Promise<{ level?: string }>
}) {
  const { orgId }  = await params
  const { level }  = await searchParams
  const supabase   = await createClient()

  const defaultLevel = Math.min(3, Math.max(1, parseInt(level ?? '2')))

  const { data: positions } = await supabase
    .from('org_positions')
    .select('id, title, level')
    .eq('organization_id', orgId)
    .eq('is_active', true)
    .order('level')
    .order('order_index')

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <Link href={`/org/${orgId}/support/rh`}
          className="text-sm text-slate-400 hover:text-slate-600 mb-2 inline-block">
          ← Retour organigramme
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nouveau poste</h1>
        <p className="text-slate-500 mt-1 text-sm">ISO 21001 §7.1.2</p>
      </div>
      <NewPositionForm
        orgId={orgId}
        defaultLevel={defaultLevel}
        existingPositions={positions ?? []}
      />
    </div>
  )
}
