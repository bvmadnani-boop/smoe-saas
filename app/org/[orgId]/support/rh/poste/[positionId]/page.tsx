import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Pencil, Users, GraduationCap,
  ClipboardList, CheckSquare, BookOpen, BadgeCheck,
} from 'lucide-react'

const LEVEL_LABEL: Record<number, string> = { 1: 'Direction', 2: 'Responsables', 3: 'Chargés & Agents' }
const LEVEL_COLOR: Record<number, string> = {
  1: 'bg-[#1B3A6B] text-white',
  2: 'bg-blue-600 text-white',
  3: 'bg-slate-500 text-white',
}

export const dynamic = 'force-dynamic'

export default async function FichePage({
  params,
}: {
  params: Promise<{ orgId: string; positionId: string }>
}) {
  const { orgId, positionId } = await params
  const supabase = await createClient()

  const { data: position } = await supabase
    .from('org_positions')
    .select(`
      id, title, level, parent_id,
      org_fiches_fonction ( * ),
      support_personnel ( * )
    `)
    .eq('id', positionId)
    .eq('organization_id', orgId)
    .single()

  if (!position) notFound()

  const fiche     = ((position.org_fiches_fonction as any[]) ?? [])[0] ?? null
  const personnel = ((position.support_personnel   as any[]) ?? []).find(p => p.status === 'actif') ?? null

  // Poste parent
  let parentTitle: string | null = null
  if (position.parent_id) {
    const { data: parent } = await supabase
      .from('org_positions')
      .select('title')
      .eq('id', position.parent_id)
      .single()
    parentTitle = parent?.title ?? null
  }

  const sections = [
    { key: 'missions',       icon: GraduationCap, label: 'Missions',         items: fiche?.missions       ?? [] },
    { key: 'responsabilites',icon: ClipboardList, label: 'Responsabilités',  items: fiche?.responsabilites ?? [] },
    { key: 'taches',         icon: CheckSquare,   label: 'Tâches principales',items: fiche?.taches        ?? [] },
  ]

  return (
    <div className="p-8 max-w-4xl">

      {/* Breadcrumb */}
      <Link href={`/org/${orgId}/support/rh`}
        className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-5">
        <ArrowLeft size={14} /> Organigramme
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          {parentTitle && (
            <p className="text-xs text-slate-400 mb-1">↳ {parentTitle}</p>
          )}
          <div className="flex items-center gap-3 mb-1">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${LEVEL_COLOR[position.level]}`}>
              Niveau {position.level} — {LEVEL_LABEL[position.level]}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{position.title}</h1>
        </div>
        <Link href={`/org/${orgId}/support/rh/poste/${positionId}/edit`}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white
                     rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
          <Pencil size={14} /> Modifier
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Colonne gauche — titulaire */}
        <div className="space-y-4">

          {/* Titulaire */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
              <Users size={14} className="text-slate-400" /> Titulaire
            </h3>
            {personnel ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1B3A6B]/10 flex items-center justify-center shrink-0">
                    <span className="text-[#1B3A6B] font-bold text-sm">
                      {personnel.full_name?.split(' ').map((n: string) => n[0]).slice(0,2).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{personnel.full_name}</p>
                    <p className="text-xs text-slate-400">{personnel.email ?? '—'}</p>
                  </div>
                </div>
                <dl className="space-y-1 text-xs">
                  {[
                    { l: 'Contrat',  v: personnel.contract_type.toUpperCase() },
                    { l: 'Entrée',   v: personnel.start_date ? new Date(personnel.start_date).toLocaleDateString('fr-FR') : '—' },
                    { l: 'Téléphone',v: personnel.phone ?? '—' },
                  ].map(({ l, v }) => (
                    <div key={l} className="flex justify-between">
                      <dt className="text-slate-400">{l}</dt>
                      <dd className="text-slate-700 font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
                {personnel.sensibilisation_done ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-2.5 py-1.5">
                    <BadgeCheck size={13} /> §7.3 Sensibilisation ✓
                  </div>
                ) : (
                  <div className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2.5 py-1.5">
                    ⚠ Sensibilisation §7.3 à compléter
                  </div>
                )}
                {personnel.teaches_courses && (
                  <Link href={`/org/${orgId}/scolarite/enseignants`}
                    className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50
                               rounded-lg px-2.5 py-1.5 hover:bg-blue-100 transition-colors">
                    <GraduationCap size={13} />
                    Enseigne aussi → P4 Scolarité
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-slate-400 italic mb-3">Poste vacant</p>
                <Link href={`/org/${orgId}/support/rh/poste/${positionId}/edit`}
                  className="text-xs text-[#1B3A6B] hover:underline font-medium">
                  + Affecter une personne
                </Link>
              </div>
            )}
          </div>

          {/* Exigences */}
          {fiche && (fiche.exigences_diplome || fiche.exigences_experience || fiche.exigences_autres) && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
                <BookOpen size={14} className="text-slate-400" /> Exigences
              </h3>
              <dl className="space-y-3 text-sm">
                {fiche.exigences_diplome && (
                  <div>
                    <dt className="text-xs text-slate-400 mb-0.5">Diplôme</dt>
                    <dd className="text-slate-700">{fiche.exigences_diplome}</dd>
                  </div>
                )}
                {fiche.exigences_experience && (
                  <div>
                    <dt className="text-xs text-slate-400 mb-0.5">Expérience</dt>
                    <dd className="text-slate-700">{fiche.exigences_experience}</dd>
                  </div>
                )}
                {fiche.exigences_autres && (
                  <div>
                    <dt className="text-xs text-slate-400 mb-0.5">Autres</dt>
                    <dd className="text-slate-700">{fiche.exigences_autres}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>

        {/* Colonne droite — fiche */}
        <div className="lg:col-span-2 space-y-4">

          {!fiche ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-10 text-center">
              <ClipboardList size={36} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium mb-1">Fiche de fonction vide</p>
              <p className="text-slate-400 text-sm mb-5">
                Rédigez le rôle, les missions, les responsabilités et les exigences du poste.
              </p>
              <Link href={`/org/${orgId}/support/rh/poste/${positionId}/edit`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white
                           rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
                <Pencil size={14} /> Rédiger la fiche
              </Link>
            </div>
          ) : (
            <>
              {/* Rôle */}
              {fiche.role_description && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-700 text-sm">Rôle</h3>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                      v{fiche.version}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{fiche.role_description}</p>
                </div>
              )}

              {/* Sections liste */}
              {sections.map(({ key, icon: Icon, label, items }) => items.length > 0 && (
                <div key={key} className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
                    <Icon size={14} className="text-slate-400" /> {label}
                  </h3>
                  <ul className="space-y-1.5">
                    {items.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-[#1B3A6B] font-bold mt-0.5 shrink-0">·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
