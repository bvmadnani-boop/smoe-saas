import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Building2, User, Calendar, MapPin, Users } from 'lucide-react'
import PfeStatusUpdater from '@/components/org/diplomation/PfeStatusUpdater'
import { notFound } from 'next/navigation'

const PFE_STATUS: Record<string, { label: string; cls: string }> = {
  pending:     { label: 'En attente',  cls: 'bg-slate-100 text-slate-500' },
  in_progress: { label: 'En cours',   cls: 'bg-blue-50 text-blue-600' },
  submitted:   { label: 'Soumis',     cls: 'bg-violet-50 text-violet-600' },
  defended:    { label: 'Soutenu',    cls: 'bg-amber-50 text-amber-600' },
  validated:   { label: 'Validé',     cls: 'bg-emerald-50 text-emerald-600' },
  rejected:    { label: 'Rejeté',     cls: 'bg-red-50 text-red-500' },
}

export default async function PfeDetailPage({
  params,
}: {
  params: Promise<{ orgId: string; pfeId: string }>
}) {
  const { orgId, pfeId } = await params
  const supabase = await createClient()

  const { data: pfe } = await supabase
    .from('pfe_projects')
    .select(`
      id, title, status, defense_date, defense_location, grade,
      host_company, supervisor_external, jury_president,
      start_date, end_date, report_url, created_at,
      students(id, full_name),
      teachers(id, full_name)
    `)
    .eq('id', pfeId)
    .eq('organization_id', orgId)
    .single()

  if (!pfe) notFound()

  const st = PFE_STATUS[pfe.status] ?? { label: pfe.status, cls: 'bg-slate-100 text-slate-500' }

  function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string | null }) {
    if (!value) return null
    return (
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
          <Icon size={15} className="text-slate-400" />
        </div>
        <div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="text-sm font-medium text-slate-800">{value}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/org/${orgId}/diplomation/pfe`}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-2">
          <ArrowLeft size={13} /> Projets PFE
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{pfe.title}</h1>
            <p className="text-slate-500 mt-1 text-sm">
              {(pfe.students as any)?.full_name ?? '—'}
            </p>
          </div>
          <span className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${st.cls}`}>
            {st.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Infos principales */}
        <div className="lg:col-span-2 space-y-4">

          {/* Détails */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="font-semibold text-slate-800 text-sm border-b border-slate-100 pb-3">
              Informations du projet
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow icon={User}      label="Étudiant"          value={(pfe.students as any)?.full_name ?? null} />
              <InfoRow icon={Building2} label="Entreprise d'accueil" value={pfe.host_company ?? null} />
              <InfoRow icon={User}      label="Encadrant interne" value={(pfe.teachers as any)?.full_name ?? null} />
              <InfoRow icon={User}      label="Encadrant externe" value={pfe.supervisor_external ?? null} />
              <InfoRow icon={Calendar}  label="Date début"        value={pfe.start_date ? new Date(pfe.start_date).toLocaleDateString('fr-FR') : null} />
              <InfoRow icon={Calendar}  label="Date fin"          value={pfe.end_date ? new Date(pfe.end_date).toLocaleDateString('fr-FR') : null} />
              <InfoRow icon={Calendar}  label="Soutenance"        value={pfe.defense_date ? new Date(pfe.defense_date).toLocaleDateString('fr-FR') : null} />
              <InfoRow icon={MapPin}    label="Lieu soutenance"   value={pfe.defense_location ?? null} />
              <InfoRow icon={Users}     label="Président du jury" value={pfe.jury_president ?? null} />
            </div>

            {pfe.grade !== null && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-2">Note finale</p>
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-bold ${
                    Number(pfe.grade) >= 10 ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {Number(pfe.grade).toFixed(2)}/20
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    Number(pfe.grade) >= 10
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-red-50 text-red-500'
                  }`}>
                    {Number(pfe.grade) >= 10 ? 'Admis' : 'Ajourné'}
                  </span>
                </div>
              </div>
            )}

            {pfe.report_url && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <a href={pfe.report_url} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-[#1B3A6B] hover:underline font-medium">
                  📄 Voir le rapport PFE →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <PfeStatusUpdater
            pfeId={pfe.id}
            currentStatus={pfe.status}
            currentGrade={pfe.grade ? Number(pfe.grade) : null}
          />

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 text-sm mb-4">Progression</h3>
            <ol className="space-y-3">
              {[
                { key: 'pending',     label: 'En attente' },
                { key: 'in_progress', label: 'En cours' },
                { key: 'submitted',   label: 'Rapport soumis' },
                { key: 'defended',    label: 'Soutenu' },
                { key: 'validated',   label: 'Validé' },
              ].map((step, i) => {
                const statuses = ['pending', 'in_progress', 'submitted', 'defended', 'validated', 'rejected']
                const currentIdx = statuses.indexOf(pfe.status)
                const stepIdx    = statuses.indexOf(step.key)
                const done    = currentIdx > stepIdx
                const current = currentIdx === stepIdx
                return (
                  <li key={step.key} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      done    ? 'bg-emerald-500 text-white' :
                      current ? 'bg-[#1B3A6B] text-white' :
                                'bg-slate-100 text-slate-400'
                    }`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs ${
                      done    ? 'text-emerald-600 font-medium' :
                      current ? 'text-[#1B3A6B] font-semibold' :
                                'text-slate-400'
                    }`}>
                      {step.label}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
