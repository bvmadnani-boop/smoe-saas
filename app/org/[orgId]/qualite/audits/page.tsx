import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AUDIT_PROCESSES, AUDIT_STATUS_META, MOIS_LABELS, type AuditStatus } from '@/lib/audit-templates'
import AuditProgramClient from '@/components/org/qualite/AuditProgramClient'

export const dynamic = 'force-dynamic'

export default async function AuditsPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  const { data: audits } = await supabase
    .from('audit_plans')
    .select('*')
    .eq('organization_id', orgId)
    .order('mois_planifie', { ascending: true })

  const list = audits ?? []

  const counts = {
    planifie: list.filter(a => a.status === 'planifie').length,
    en_cours: list.filter(a => a.status === 'en_cours').length,
    realise:  list.filter(a => a.status === 'realise').length,
    total:    list.length,
  }

  const pctRealise = counts.total > 0
    ? Math.round((counts.realise / counts.total) * 100) : 0

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link href={`/org/${orgId}/qualite`}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-1">
            <ArrowLeft size={13} /> Qualité ISO
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Audits internes</h1>
          <p className="text-slate-500 mt-1 text-sm">
            ISO 21001 §9.2 — Programme annuel · {AUDIT_PROCESSES.length} processus à auditer
          </p>
        </div>
      </div>

      {/* Barre de progression */}
      {counts.total > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700">
              Avancement du programme {new Date().getFullYear()}
            </p>
            <span className="text-sm font-bold text-[#1B3A6B]">{pctRealise}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${pctRealise}%` }}
            />
          </div>
          <div className="flex items-center gap-5 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              {counts.realise} réalisé{counts.realise > 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              {counts.en_cours} en cours
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              {counts.planifie} planifié{counts.planifie > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      <AuditProgramClient orgId={orgId} audits={list} />
    </div>
  )
}
