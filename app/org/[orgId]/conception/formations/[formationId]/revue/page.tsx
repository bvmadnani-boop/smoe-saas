'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  REVUE_ETAPE_META, REVUE_STATUT_META, REVUE_CHECKLIST,
  type RevueEtape, type RevueStatut,
} from '@/lib/conception-templates'
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp, Save } from 'lucide-react'

interface Revue {
  id: string; etape: RevueEtape; statut: RevueStatut
  commentaire: string | null; reviewer_name: string | null; reviewed_at: string | null
  checklist_results: Record<string, boolean>
}

export default function RevueConceptionPage() {
  const params = useParams<{ orgId: string; formationId: string }>()
  const { orgId, formationId } = params
  const supabase = createClient()

  const [formation, setFormation] = useState<any>(null)
  const [revues,    setRevues]    = useState<Revue[]>([])
  const [expanded,  setExpanded]  = useState<Record<string, boolean>>({
    responsable_pedagogique: true,
  })
  const [saving,    setSaving]    = useState<string | null>(null)

  // Editing state per étape
  const [editData, setEditData] = useState<Record<string, {
    statut: RevueStatut; commentaire: string; reviewer_name: string
    checklist: Record<string, boolean>
  }>>({})

  useEffect(() => {
    async function load() {
      const [{ data: f }, { data: r }] = await Promise.all([
        supabase.from('formations').select('id, title, statut, version').eq('id', formationId).single(),
        supabase.from('formation_revues').select('*').eq('formation_id', formationId),
      ])
      setFormation(f)
      const revList = r ?? []
      setRevues(revList as Revue[])
      // Init edit data for each étape
      const init: typeof editData = {}
      ;(['responsable_pedagogique','directeur','sup2i'] as RevueEtape[]).forEach(etape => {
        const existing = revList.find(rv => rv.etape === etape) as Revue | undefined
        init[etape] = {
          statut:        existing?.statut ?? 'en_attente',
          commentaire:   existing?.commentaire ?? '',
          reviewer_name: existing?.reviewer_name ?? '',
          checklist:     existing?.checklist_results ?? {},
        }
      })
      setEditData(init)
    }
    load()
  }, [formationId])

  function toggleCheck(etape: string, idx: number) {
    setEditData(prev => ({
      ...prev,
      [etape]: {
        ...prev[etape],
        checklist: { ...prev[etape].checklist, [idx]: !prev[etape].checklist[idx] },
      },
    }))
  }

  async function saveRevue(etape: RevueEtape) {
    setSaving(etape)
    const d = editData[etape]
    const existing = revues.find(r => r.etape === etape)

    const payload = {
      formation_id:       formationId,
      organization_id:    orgId,
      etape,
      statut:             d.statut,
      commentaire:        d.commentaire || null,
      reviewer_name:      d.reviewer_name || null,
      reviewed_at:        d.statut !== 'en_attente' ? new Date().toISOString() : null,
      checklist_results:  d.checklist,
      version_formation:  formation?.version,
    }

    let newRevue
    if (existing) {
      const { data } = await supabase.from('formation_revues').update(payload).eq('id', existing.id).select().single()
      newRevue = data
    } else {
      const { data } = await supabase.from('formation_revues').insert(payload).select().single()
      newRevue = data
    }

    if (newRevue) {
      setRevues(prev => {
        const filtered = prev.filter(r => r.etape !== etape)
        return [...filtered, newRevue as Revue]
      })
    }
    setSaving(null)
  }

  const inputCls = `w-full px-3 py-2 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`

  if (!formation) return <div className="p-8 text-sm text-slate-400">Chargement...</div>

  const etapes: RevueEtape[] = ['responsable_pedagogique', 'directeur', 'sup2i']

  // Global validation status
  const allApproved = etapes.every(e => {
    const r = revues.find(rv => rv.etape === e)
    return r?.statut === 'approuve' || r?.statut === 'approuve_avec_reserves'
  })

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href={`/org/${orgId}/conception/formations/${formationId}`}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-2">
          <ArrowLeft size={13} /> {formation.title}
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Revue de conception §8.3.4</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Validation en 3 niveaux — v{formation.version}
        </p>
      </div>

      {/* Statut global */}
      <div className={`rounded-xl border px-4 py-3 mb-5 flex items-center gap-3 ${
        allApproved
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-slate-50 border-slate-200'
      }`}>
        <CheckCircle2 size={16} className={allApproved ? 'text-emerald-600' : 'text-slate-300'} />
        <p className={`text-sm font-medium ${allApproved ? 'text-emerald-800' : 'text-slate-500'}`}>
          {allApproved
            ? '✓ Formation validée par les 3 niveaux — prête à être activée'
            : 'Validation en cours — les 3 étapes doivent être approuvées'
          }
        </p>
      </div>

      {/* Étapes */}
      <div className="space-y-4">
        {etapes.map((etape, idx) => {
          const meta     = REVUE_ETAPE_META[etape]
          const existing = revues.find(r => r.etape === etape)
          const d        = editData[etape] ?? { statut: 'en_attente', commentaire: '', reviewer_name: '', checklist: {} }
          const stMeta   = REVUE_STATUT_META[d.statut]
          const checklist = REVUE_CHECKLIST[etape] ?? []
          const isOpen   = expanded[etape] !== false
          const checkCount = Object.values(d.checklist).filter(Boolean).length

          return (
            <div key={etape} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Header */}
              <button type="button" onClick={() => setExpanded(p => ({ ...p, [etape]: !isOpen }))}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors text-left">
                <span className="w-7 h-7 rounded-full bg-[#1B3A6B]/10 text-[#1B3A6B] text-sm
                                 flex items-center justify-center shrink-0 font-bold">
                  {meta.icon}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800 text-sm">{meta.label}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${stMeta.cls}`}>
                      {stMeta.icon} {stMeta.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{meta.desc}</p>
                </div>
                {checklist.length > 0 && (
                  <span className="text-xs text-slate-400 shrink-0">
                    {checkCount}/{checklist.length} critères
                  </span>
                )}
                {isOpen ? <ChevronUp size={14} className="text-slate-400 shrink-0" /> : <ChevronDown size={14} className="text-slate-400 shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 border-t border-slate-50 space-y-4 pt-4">

                  {/* Checklist */}
                  {checklist.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-600 mb-2">Critères de vérification</p>
                      {checklist.map((q, i) => (
                        <label key={i} className="flex items-start gap-2.5 cursor-pointer group">
                          <input type="checkbox"
                            checked={!!d.checklist[i]}
                            onChange={() => toggleCheck(etape, i)}
                            className="mt-0.5 accent-[#1B3A6B] w-4 h-4 shrink-0"
                          />
                          <span className={`text-xs leading-relaxed transition-colors ${
                            d.checklist[i] ? 'text-emerald-700' : 'text-slate-600 group-hover:text-slate-800'
                          }`}>{q}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Décision */}
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2">Décision</p>
                    <div className="flex gap-2 flex-wrap">
                      {(['en_attente','approuve','approuve_avec_reserves','refuse'] as RevueStatut[]).map(s => {
                        const sm = REVUE_STATUT_META[s]
                        return (
                          <button key={s} type="button"
                            onClick={() => setEditData(p => ({ ...p, [etape]: { ...p[etape], statut: s } }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              d.statut === s ? 'bg-[#1B3A6B] border-[#1B3A6B] text-white' : `${sm.cls} hover:opacity-80`
                            }`}>
                            {sm.icon} {sm.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Revieweur + Commentaire */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Réviseur</label>
                      <input type="text" value={d.reviewer_name}
                        onChange={e => setEditData(p => ({ ...p, [etape]: { ...p[etape], reviewer_name: e.target.value } }))}
                        placeholder="Nom du réviseur" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Commentaire {d.statut === 'refuse' || d.statut === 'approuve_avec_reserves' ? '*' : ''}
                      </label>
                      <textarea value={d.commentaire}
                        onChange={e => setEditData(p => ({ ...p, [etape]: { ...p[etape], commentaire: e.target.value } }))}
                        rows={2} placeholder="Observations, réserves ou motif de refus..."
                        className={`${inputCls} resize-none`} />
                    </div>
                  </div>

                  {existing?.reviewed_at && (
                    <p className="text-xs text-slate-400">
                      Dernière mise à jour : {new Date(existing.reviewed_at).toLocaleDateString('fr-FR')}
                    </p>
                  )}

                  <button onClick={() => saveRevue(etape)} disabled={saving === etape}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1B3A6B] text-white rounded-lg
                               text-xs font-medium hover:bg-[#2E5BA8] disabled:opacity-50 transition-colors">
                    <Save size={13} />
                    {saving === etape ? 'Enregistrement...' : 'Enregistrer cette étape'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
