import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import FormationEditor from '@/components/org/conception/FormationEditor'

export const dynamic = 'force-dynamic'

export default async function NewFormationPage({
  params,
}: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  const supabase  = await createClient()

  const [{ data: referentiels }, { data: filieres }] = await Promise.all([
    supabase.from('referentiels_competences').select('id, code, title').eq('organization_id', orgId).eq('is_active', true),
    supabase.from('filieres').select('id, name').eq('organization_id', orgId),
  ])

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href={`/org/${orgId}/conception/formations`}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-2">
          <ArrowLeft size={13} /> Catalogue
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nouvelle formation</h1>
        <p className="text-slate-500 mt-1 text-sm">ISO 21001 §8.3.2 — Données d'entrée de la conception</p>
      </div>
      <FormationEditor
        orgId={orgId}
        mode="new"
        referentiels={referentiels ?? []}
        filieres={filieres ?? []}
      />
    </div>
  )
}
