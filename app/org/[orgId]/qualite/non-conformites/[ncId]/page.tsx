import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, AlertTriangle } from 'lucide-react'
import { notFound } from 'next/navigation'
import NcOcapEditor from '@/components/org/qualite/NcOcapEditor'
import {
  NC_CATEGORY_META, NC_SEVERITY_META, NC_STATUS_META,
  type NcCategory,
} from '@/lib/nc-ocap-templates'

export const dynamic = 'force-dynamic'

export default async function NcDetailPage({
  params,
}: {
  params: Promise<{ orgId: string; ncId: string }>
}) {
  const { orgId, ncId } = await params
  const supabase = await createClient()

  const { data: nc } = await supabase
    .from('nonconformities')
    .select('*')
    .eq('id', ncId)
    .eq('organization_id', orgId)
    .single()

  if (!nc) notFound()

  const catMeta = NC_CATEGORY_META[nc.category as NcCategory]
  const sevMeta = NC_SEVERITY_META[nc.severity as keyof typeof NC_SEVERITY_META]
  const stMeta  = NC_STATUS_META[nc.status as keyof typeof NC_STATUS_META]

  const SOURCE_LABELS: Record<string, string> = {
    manuel:       'Manuel',
    automatique:  'Automatique système',
    audit:        'Audit interne',
    reclamation:  'Réclamation',
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/org/${orgId}/qualite/non-conformites`}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-2">
          <ArrowLeft size={13} /> Non-Conformités
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${catMeta?.badgeCls ?? ''}`}>
                {catMeta?.label ?? nc.category}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${sevMeta?.cls ?? ''}`}>
                {sevMeta?.label ?? nc.severity}
              </span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                v{nc.version}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">{nc.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                Détectée le {nc.detected_at ? new Date(nc.detected_at).toLocaleDateString('fr-FR') : '—'}
              </span>
              <span>Source : {SOURCE_LABELS[nc.source] ?? nc.source}</span>
              {nc.ocap_responsible && (
                <span className="flex items-center gap-1">
                  <User size={11} /> {nc.ocap_responsible}
                </span>
              )}
            </div>
          </div>
          <span className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${stMeta?.cls ?? ''}`}>
            {stMeta?.label ?? nc.status}
          </span>
        </div>
      </div>

      {/* Alerte si majeure et non clôturée */}
      {nc.severity === 'majeure' && nc.status !== 'cloturee' && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-5">
          <AlertTriangle size={16} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">
            <strong>NC Majeure</strong> — Traitement prioritaire. Impact potentiel sur l'accréditation SUP2I.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Détails NC */}
        <div className="lg:col-span-2 space-y-4">

          {/* Description */}
          {nc.description && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-800 text-sm mb-3 border-b border-slate-100 pb-2">
                Description
              </h2>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{nc.description}</p>
            </div>
          )}

          {/* OCAP résumé en lecture */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
            <h2 className="font-semibold text-slate-800 text-sm border-b border-slate-100 pb-2">
              OCAP — Out of Control Action Plan
            </h2>

            {[
              { letter: 'C', label: 'Containment — Action immédiate', value: nc.ocap_containment, color: 'amber' },
              { letter: 'A', label: 'Analyse — Cause racine',          value: nc.ocap_cause,       color: 'blue' },
              { letter: 'P', label: 'Plan — Action corrective',         value: nc.ocap_plan,        color: 'emerald' },
            ].map(({ letter, label, value, color }) => (
              <div key={letter} className="flex gap-3">
                <div className={`w-7 h-7 rounded-full bg-${color}-100 text-${color}-700 text-sm font-bold flex items-center justify-center shrink-0 mt-0.5`}>
                  {letter}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-600 mb-1">{label}</p>
                  {value
                    ? <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{value}</p>
                    : <p className="text-sm text-slate-300 italic">Non renseigné</p>
                  }
                </div>
              </div>
            ))}

            {/* Deadline + Efficacité */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Délai prévu</p>
                <p className="text-sm font-medium text-slate-700">
                  {nc.ocap_deadline
                    ? new Date(nc.ocap_deadline).toLocaleDateString('fr-FR')
                    : '—'}
                </p>
              </div>
              {nc.status === 'cloturee' && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Efficacité vérifiée</p>
                  <p className={`text-sm font-medium ${nc.ocap_effective ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {nc.ocap_effective ? '✓ Oui' : '✗ Non vérifiée'}
                  </p>
                </div>
              )}
            </div>

            {nc.ocap_evidence && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
                <p className="text-xs font-semibold text-emerald-700 mb-1">Preuve de clôture</p>
                <p className="text-sm text-emerald-800 whitespace-pre-wrap">{nc.ocap_evidence}</p>
              </div>
            )}
          </div>

          {/* Clôture info */}
          {nc.closed_at && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-sm text-emerald-700">
              NC clôturée le {new Date(nc.closed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div>
          <NcOcapEditor
            ncId={nc.id}
            currentStatus={nc.status}
            currentVersion={nc.version ?? 1}
            ocap={{
              containment: nc.ocap_containment,
              cause:       nc.ocap_cause,
              plan:        nc.ocap_plan,
              responsible: nc.ocap_responsible,
              deadline:    nc.ocap_deadline,
              evidence:    nc.ocap_evidence,
              effective:   nc.ocap_effective,
            }}
          />
        </div>
      </div>
    </div>
  )
}
