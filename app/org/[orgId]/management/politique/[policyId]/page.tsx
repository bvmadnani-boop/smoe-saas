import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import PolicyEditor from '@/components/org/qualite/PolicyEditor'
import { POLICY_STATUS_META } from '@/lib/policy-templates'

export const dynamic = 'force-dynamic'

export default async function PolitiqueDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string; policyId: string }>
  searchParams: Promise<{ print?: string }>
}) {
  const { orgId, policyId } = await params
  const { print }           = await searchParams
  const supabase = await createClient()

  const { data: policy } = await supabase
    .from('quality_policies')
    .select('*')
    .eq('id', policyId)
    .eq('organization_id', orgId)
    .single()

  if (!policy) notFound()

  const stMeta = POLICY_STATUS_META[policy.status as keyof typeof POLICY_STATUS_META]

  // Vue impression
  if (print === '1') {
    return (
      <div className="p-12 max-w-4xl mx-auto">
        <div className="text-center mb-10 border-b border-slate-200 pb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{policy.title}</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-500 flex-wrap">
            <span>Version {policy.version}</span>
            {policy.approver_name && <span>Approuvée par {policy.approver_name}</span>}
            {policy.approved_at && <span>le {new Date(policy.approved_at).toLocaleDateString('fr-FR')}</span>}
            {policy.review_date && <span>Révision prévue : {new Date(policy.review_date).toLocaleDateString('fr-FR')}</span>}
          </div>
        </div>
        <div className="prose prose-slate max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800">
            {policy.content}
          </pre>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs text-slate-400 mb-6">Signature Directeur</p>
            <div className="border-b border-slate-300 h-12" />
            <p className="text-xs text-slate-500 mt-1">{policy.approver_name ?? '.....................'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-6">Cachet de l'établissement</p>
            <div className="border border-dashed border-slate-300 h-20 rounded-lg flex items-center justify-center">
              <span className="text-xs text-slate-300">Cachet officiel</span>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <button onClick={() => window.print()}
            className="px-6 py-2 bg-[#1B3A6B] text-white rounded-lg text-sm no-print">
            🖨️ Imprimer / Enregistrer en PDF
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href={`/org/${orgId}/management/politique`}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-2">
          <ArrowLeft size={13} /> Politique qualité
        </Link>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{policy.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stMeta?.cls}`}>
                {stMeta?.label}
              </span>
              <span className="text-xs text-slate-400 font-mono">v{policy.version}</span>
              {policy.approver_name && (
                <span className="text-xs text-slate-400">· Approuvée par {policy.approver_name}</span>
              )}
            </div>
          </div>
          <Link href={`/org/${orgId}/management/politique/${policyId}?print=1`}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600
                       rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors shrink-0">
            🖨️ Vue impression
          </Link>
        </div>
      </div>

      <PolicyEditor
        orgId={orgId}
        mode="edit"
        policy={{
          id:           policy.id,
          title:        policy.title,
          content:      policy.content,
          template_used: policy.template_used,
          version:      policy.version,
          status:       policy.status,
          approver_name:  policy.approver_name,
          approved_at:  policy.approved_at,
          review_date:  policy.review_date,
        }}
      />
    </div>
  )
}
