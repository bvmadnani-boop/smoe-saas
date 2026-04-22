import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import FicheFonctionEditor from '@/components/org/support/FicheFonctionEditor'
import PersonnelAssigner   from '@/components/org/support/PersonnelAssigner'

export const dynamic = 'force-dynamic'

export default async function EditFichePage({
  params,
}: {
  params: Promise<{ orgId: string; positionId: string }>
}) {
  const { orgId, positionId } = await params
  const supabase = await createClient()

  const { data: position } = await supabase
    .from('org_positions')
    .select(`
      id, title, level,
      org_fiches_fonction ( * ),
      support_personnel ( * )
    `)
    .eq('id', positionId)
    .eq('organization_id', orgId)
    .single()

  if (!position) notFound()

  const fiche     = ((position.org_fiches_fonction as any[]) ?? [])[0] ?? null
  const personnel = ((position.support_personnel   as any[]) ?? []).find(p => p.status === 'actif') ?? null

  const LEVEL_LABEL: Record<number, string> = { 1: 'Direction', 2: 'Responsables', 3: 'Chargés & Agents' }

  return (
    <div className="p-8 max-w-3xl">

      <Link href={`/org/${orgId}/support/rh/poste/${positionId}`}
        className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-5">
        <ArrowLeft size={14} /> Fiche du poste
      </Link>

      <div className="mb-8">
        <p className="text-xs text-slate-400 mb-1">
          Niveau {position.level} — {LEVEL_LABEL[position.level]}
        </p>
        <h1 className="text-2xl font-bold text-slate-900">{position.title}</h1>
        <p className="text-slate-500 mt-1 text-sm">Modifier la fiche de fonction</p>
      </div>

      {/* Section titulaire */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
        <PersonnelAssigner
          orgId={orgId}
          positionId={positionId}
          existingPersonnel={personnel}
        />
      </div>

      {/* Section fiche */}
      <FicheFonctionEditor
        orgId={orgId}
        positionId={positionId}
        existingFiche={fiche}
      />
    </div>
  )
}
