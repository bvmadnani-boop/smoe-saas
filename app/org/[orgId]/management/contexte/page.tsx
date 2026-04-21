import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ContextTabs from '@/components/org/qualite/ContextTabs'
import ContextSeeder from '@/components/org/qualite/ContextSeeder'

export const dynamic = 'force-dynamic'

export default async function ContextePage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  const [
    { data: swotItems },
    { data: pestelItems },
    { data: parties },
  ] = await Promise.all([
    supabase
      .from('swot_items')
      .select('id, quadrant, content, is_active')
      .eq('organization_id', orgId)
      .order('sort_order', { ascending: true }),
    supabase
      .from('pestel_items')
      .select('id, dimension, content, impact, is_active')
      .eq('organization_id', orgId),
    supabase
      .from('interested_parties')
      .select('id, name, category, group_key, needs, expectations, influence_level, interest_level, is_active')
      .eq('organization_id', orgId)
      .order('group_key', { ascending: true }),
  ])

  const isEmpty = !swotItems?.length && !pestelItems?.length && !parties?.length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link href={`/org/${orgId}/management`}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-1">
            <ArrowLeft size={13} /> Management
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Contexte de l'organisation</h1>
          <p className="text-slate-500 mt-1 text-sm">
            ISO 21001 §4 — SWOT · PESTEL · Parties intéressées
          </p>
        </div>

        {/* Compteurs rapides */}
        <div className="flex items-center gap-3">
          <div className="flex gap-2 text-xs text-slate-500">
            <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
              {swotItems?.length ?? 0} SWOT
            </span>
            <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
              {pestelItems?.length ?? 0} PESTEL
            </span>
            <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
              {parties?.length ?? 0} PI
            </span>
          </div>
          <ContextSeeder orgId={orgId} />
        </div>
      </div>

      {/* Bannière pré-remplissage si vide */}
      {isEmpty && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-800">Contexte vide</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Cliquez sur <strong>"Pré-remplir depuis modèle SUP2I"</strong> pour charger automatiquement
              {' '}8 forces, 8 faiblesses, 9 opportunités, 8 menaces, 28 facteurs PESTEL et 25 parties intéressées.
              Vous pourrez ensuite personnaliser chaque élément.
            </p>
          </div>
          <ContextSeeder orgId={orgId} />
        </div>
      )}

      {/* Tabs content */}
      <ContextTabs
        orgId={orgId}
        swotItems={swotItems ?? []}
        pestelItems={pestelItems ?? []}
        parties={parties ?? []}
      />
    </div>
  )
}
