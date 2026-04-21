import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ManagementReviewDoc from '@/components/org/qualite/ManagementReviewDoc'

export const dynamic = 'force-dynamic'

export default async function NewRevuePage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  // ── Collecter toutes les données du SMQ ──────────────────────────────────
  const [
    { data: ncs },
    { data: activePolicy },
    { data: allRisks },
    { data: audits },
    { data: swot },
    { data: pestel },
    { data: parties },
    { data: teachers },
    { data: schedules },
    { data: previousReview },
  ] = await Promise.all([
    supabase.from('nonconformities')
      .select('id, title, severity, status, category, detected_at, ocap_deadline')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false }),
    supabase.from('quality_policies')
      .select('id, title, version, status, approver_name, approved_at, review_date')
      .eq('organization_id', orgId).eq('status', 'active').single(),
    supabase.from('risks')
      .select('id, title, type, score, status, treatment, category')
      .eq('organization_id', orgId).eq('is_active', true).order('score', { ascending: false }),
    supabase.from('audit_plans')
      .select('id, title, process_key, status, audit_date, trimestre')
      .eq('organization_id', orgId).order('audit_date', { ascending: true }),
    supabase.from('swot_items')
      .select('id, quadrant, content, is_active').eq('organization_id', orgId),
    supabase.from('pestel_items')
      .select('id, dimension, content, impact, is_active').eq('organization_id', orgId),
    supabase.from('interested_parties')
      .select('id, name, group_key, needs, expectations, is_active')
      .eq('organization_id', orgId),
    supabase.from('teachers')
      .select('id, full_name, sup2i_validated').eq('organization_id', orgId),
    supabase.from('schedules')
      .select('id, teacher_id, teachers(id, sup2i_validated)').eq('organization_id', orgId),
    supabase.from('management_reviews')
      .select('id, title, review_date, status').eq('organization_id', orgId)
      .eq('status', 'realise').order('review_date', { ascending: false }).limit(1).single(),
  ])

  // Calculs SUP2I
  const nonValidatedInSchedule = (schedules ?? []).filter(s => {
    const t = s.teachers as any
    return t && t.sup2i_validated === false
  })
  const totalTeachers      = teachers?.length ?? 0
  const validatedTeachers  = teachers?.filter(t => t.sup2i_validated).length ?? 0
  const sup2iPct           = totalTeachers > 0
    ? Math.round((validatedTeachers / totalTeachers) * 100) : 0

  const data = {
    ncs:                    ncs ?? [],
    activePolicy:           activePolicy ?? null,
    risks:                  allRisks ?? [],
    audits:                 audits ?? [],
    swot:                   swot ?? [],
    pestel:                 pestel ?? [],
    parties:                parties ?? [],
    totalTeachers,
    validatedTeachers,
    sup2iPct,
    nonValidatedCount:      nonValidatedInSchedule.length,
    previousReview:         previousReview ?? null,
    generatedAt:            new Date().toISOString(),
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <Link href={`/org/${orgId}/qualite/revue`}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-2">
          <ArrowLeft size={13} /> Revues de direction
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nouvelle revue de direction</h1>
        <p className="text-slate-500 mt-1 text-sm">ISO 21001 §9.3 — Document généré automatiquement depuis le SMQ</p>
      </div>
      <ManagementReviewDoc orgId={orgId} mode="new" data={data} />
    </div>
  )
}
