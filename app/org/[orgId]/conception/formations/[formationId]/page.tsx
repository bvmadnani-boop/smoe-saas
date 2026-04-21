import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, BookOpen, ClipboardList, CheckCircle2, Star } from 'lucide-react'
import { notFound } from 'next/navigation'
import { FORMATION_STATUT_META, REVUE_ETAPE_META, REVUE_STATUT_META } from '@/lib/conception-templates'
import FormationEditor from '@/components/org/conception/FormationEditor'

export const dynamic = 'force-dynamic'

export default async function FormationDetailPage({
  params,
}: { params: Promise<{ orgId: string; formationId: string }> }) {
  const { orgId, formationId } = await params
  const supabase = await createClient()

  const [
    { data: formation },
    { data: modules },
    { data: evaluations },
    { data: revues },
    { data: referentiels },
    { data: filieres },
    { data: schedules },
  ] = await Promise.all([
    supabase.from('formations').select('*').eq('id', formationId).eq('organization_id', orgId).single(),
    supabase.from('formation_modules').select('id, code, title, type, volume_horaire, ordre')
      .eq('formation_id', formationId).order('ordre'),
    supabase.from('formation_evaluations').select('id, titre, type, coefficient')
      .eq('formation_id', formationId),
    supabase.from('formation_revues').select('*').eq('formation_id', formationId).order('created_at'),
    supabase.from('referentiels_competences').select('id, code, title').eq('organization_id', orgId).eq('is_active', true),
    supabase.from('filieres').select('id, name').eq('organization_id', orgId),
    // Lien emploi du temps
    supabase.from('schedule_formations').select('id, schedules(id, day, time_slot, room)')
      .eq('formation_id', formationId).limit(5),
  ])

  if (!formation) notFound()

  const stMeta    = FORMATION_STATUT_META[formation.statut]
  const modsList  = modules ?? []
  const evalsList = evaluations ?? []
  const revList   = revues ?? []
  const schedList = schedules ?? []

  const totalHeures = modsList.reduce((sum, m) => sum + (m.volume_horaire ?? 0), 0)
  const lastRevue   = revList[revList.length - 1]

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/org/${orgId}/conception/formations`}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-2">
          <ArrowLeft size={13} /> Catalogue
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {formation.code && (
                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {formation.code}
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${stMeta.cls}`}>
                {stMeta.label}
              </span>
              <span className="text-xs text-slate-400 font-mono">v{formation.version}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{formation.title}</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {formation.duree_totale_heures && `${formation.duree_totale_heures}h · `}
              {formation.modalite === 'presentiel' ? 'Présentiel' : formation.modalite === 'hybride' ? 'Hybride' : 'Distanciel'}
              {totalHeures > 0 && ` · ${totalHeures}h planifiées`}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href={`/org/${orgId}/conception/formations/${formationId}/plan`}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#1B3A6B] text-white
                         rounded-lg text-xs font-medium hover:bg-[#2E5BA8] transition-colors">
              <BookOpen size={13} /> Plan pédagogique
            </Link>
            <Link href={`/org/${orgId}/conception/formations/${formationId}/evaluations`}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600
                         rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors">
              <ClipboardList size={13} /> Évaluations
            </Link>
            <Link href={`/org/${orgId}/conception/formations/${formationId}/revue`}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600
                         rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors">
              <CheckCircle2 size={13} /> Revue §8.3.4
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

        {/* Résumé modules */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-700">Plan pédagogique</p>
            <Link href={`/org/${orgId}/conception/formations/${formationId}/plan`}
              className="text-xs text-[#1B3A6B] hover:underline">Modifier →</Link>
          </div>
          {modsList.length === 0 ? (
            <p className="text-xs text-slate-400">Aucun module — commencez le plan pédagogique.</p>
          ) : (
            <div className="space-y-1.5">
              {modsList.map(m => (
                <div key={m.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 truncate flex-1">{m.title}</span>
                  <span className="text-slate-400 ml-2 shrink-0">{m.volume_horaire ?? '—'}h</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-100 flex justify-between text-xs font-semibold">
                <span className="text-slate-600">{modsList.length} modules</span>
                <span className="text-[#1B3A6B]">{totalHeures}h total</span>
              </div>
            </div>
          )}
        </div>

        {/* Résumé évaluations */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-700">Évaluations</p>
            <Link href={`/org/${orgId}/conception/formations/${formationId}/evaluations`}
              className="text-xs text-[#1B3A6B] hover:underline">Modifier →</Link>
          </div>
          {evalsList.length === 0 ? (
            <p className="text-xs text-slate-400">Aucune évaluation définie.</p>
          ) : (
            <div className="space-y-1.5">
              {evalsList.map(e => (
                <div key={e.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 truncate flex-1">{e.titre}</span>
                  {e.coefficient && (
                    <span className="text-slate-400 ml-2 shrink-0">coef. {e.coefficient}</span>
                  )}
                </div>
              ))}
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
                {evalsList.length} évaluation{evalsList.length > 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>

        {/* Statut revues */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-700">Revues §8.3.4</p>
            <Link href={`/org/${orgId}/conception/formations/${formationId}/revue`}
              className="text-xs text-[#1B3A6B] hover:underline">Voir →</Link>
          </div>
          <div className="space-y-2">
            {(['responsable_pedagogique','directeur','sup2i'] as const).map(etape => {
              const revue   = revList.find(r => r.etape === etape)
              const meta    = REVUE_ETAPE_META[etape]
              const stMeta  = revue ? REVUE_STATUT_META[revue.statut] : REVUE_STATUT_META['en_attente']
              return (
                <div key={etape} className="flex items-center gap-2">
                  <span className="text-base shrink-0">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-600 truncate">{meta.label}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0 ${stMeta.cls}`}>
                    {stMeta.icon} {stMeta.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Lien emploi du temps */}
      {schedList.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
          <Star size={15} className="text-blue-500 shrink-0" />
          <p className="text-sm text-blue-800">
            Cette formation est planifiée dans <strong>{schedList.length} créneau{schedList.length > 1 ? 'x' : ''}</strong> de l'emploi du temps.
          </p>
          <Link href={`/org/${orgId}/scolarite/emploi-du-temps`}
            className="ml-auto text-xs text-blue-600 hover:underline font-medium whitespace-nowrap">
            Voir l'EDT →
          </Link>
        </div>
      )}

      {/* Éditeur formation */}
      <FormationEditor
        orgId={orgId}
        mode="edit"
        referentiels={referentiels ?? []}
        filieres={filieres ?? []}
        formation={{
          id: formation.id, code: formation.code, title: formation.title,
          statut: formation.statut, filiere_id: formation.filiere_id,
          public_cible: formation.public_cible, prerequis: formation.prerequis,
          objectifs_generaux: formation.objectifs_generaux,
          duree_totale_heures: formation.duree_totale_heures,
          modalite: formation.modalite, referentiel_id: formation.referentiel_id,
          version: formation.version,
        }}
      />
    </div>
  )
}
