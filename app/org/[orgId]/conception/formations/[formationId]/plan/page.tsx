'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  MODULE_TYPE_META, SEANCE_METHODE_META,
  type ModuleType, type SeanceMethode,
} from '@/lib/conception-templates'
import { ArrowLeft, Plus, Trash2, GripVertical, Clock, ChevronDown, ChevronUp } from 'lucide-react'

interface Seance {
  id: string; titre: string; objectif: string | null
  methode: SeanceMethode; duree_heures: number | null; ordre: number
  teacher_id: string | null; teacher_name?: string
}
interface Module {
  id: string; code: string | null; title: string; type: ModuleType
  volume_horaire: number | null; ordre: number; seances?: Seance[]
}

export default function PlanPedagogiquePage() {
  const params = useParams<{ orgId: string; formationId: string }>()
  const { orgId, formationId } = params
  const supabase = createClient()

  const [formation, setFormation] = useState<any>(null)
  const [modules,   setModules]   = useState<Module[]>([])
  const [teachers,  setTeachers]  = useState<any[]>([])
  const [expanded,  setExpanded]  = useState<Record<string, boolean>>({})
  const [loading,   setLoading]   = useState(true)

  // Forms
  const [showModForm, setShowModForm] = useState(false)
  const [newModTitle, setNewModTitle] = useState('')
  const [newModCode,  setNewModCode]  = useState('')
  const [newModType,  setNewModType]  = useState<ModuleType>('cours')
  const [newModVH,    setNewModVH]    = useState('')

  const [showSeanceForm, setShowSeanceForm] = useState<string | null>(null) // moduleId
  const [newSeanceTitre,    setNewSeanceTitre]    = useState('')
  const [newSeanceObjectif, setNewSeanceObjectif] = useState('')
  const [newSeanceMethode,  setNewSeanceMethode]  = useState<SeanceMethode>('cours_magistral')
  const [newSeanceDuree,    setNewSeanceDuree]     = useState('')
  const [newSeanceTeacher,  setNewSeanceTeacher]   = useState('')

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: f }, { data: mods }, { data: seances }, { data: tchs }] = await Promise.all([
        supabase.from('formations').select('id, code, title').eq('id', formationId).single(),
        supabase.from('formation_modules').select('*').eq('formation_id', formationId).order('ordre'),
        supabase.from('formation_seances').select('*, teachers(full_name)')
          .eq('formation_id', formationId).order('ordre'),
        supabase.from('teachers').select('id, full_name, sup2i_validated').eq('organization_id', orgId),
      ])
      setFormation(f)
      setTeachers(tchs ?? [])
      const modsWithSeances = (mods ?? []).map(m => ({
        ...m,
        seances: (seances ?? [])
          .filter(s => s.module_id === m.id)
          .map(s => ({ ...s, teacher_name: (s.teachers as any)?.full_name })),
      }))
      setModules(modsWithSeances)
      // Expand first module by default
      if (mods && mods.length > 0) {
        setExpanded({ [mods[0].id]: true })
      }
      setLoading(false)
    }
    load()
  }, [formationId])

  async function addModule() {
    if (!newModTitle.trim()) return
    setSaving(true)
    const { data } = await supabase.from('formation_modules').insert({
      formation_id:   formationId,
      organization_id: orgId,
      code:           newModCode.trim() || null,
      title:          newModTitle.trim(),
      type:           newModType,
      volume_horaire: newModVH ? parseFloat(newModVH) : null,
      ordre:          modules.length,
    }).select().single()
    if (data) {
      setModules(prev => [...prev, { ...data, seances: [] }])
      setExpanded(prev => ({ ...prev, [data.id]: true }))
      setNewModTitle(''); setNewModCode(''); setNewModVH('')
      setShowModForm(false)
    }
    setSaving(false)
  }

  async function deleteModule(id: string) {
    if (!confirm('Supprimer ce module et toutes ses séances ?')) return
    await supabase.from('formation_modules').delete().eq('id', id)
    setModules(prev => prev.filter(m => m.id !== id))
  }

  async function addSeance(moduleId: string) {
    if (!newSeanceTitre.trim()) return
    setSaving(true)
    const mod = modules.find(m => m.id === moduleId)
    const ordre = mod?.seances?.length ?? 0
    const { data } = await supabase.from('formation_seances').insert({
      module_id:      moduleId,
      formation_id:   formationId,
      organization_id: orgId,
      titre:          newSeanceTitre.trim(),
      objectif:       newSeanceObjectif.trim() || null,
      methode:        newSeanceMethode,
      duree_heures:   newSeanceDuree ? parseFloat(newSeanceDuree) : null,
      teacher_id:     newSeanceTeacher || null,
      ordre,
    }).select('*, teachers(full_name)').single()
    if (data) {
      const newSeance = { ...data, teacher_name: (data.teachers as any)?.full_name }
      setModules(prev => prev.map(m =>
        m.id === moduleId ? { ...m, seances: [...(m.seances ?? []), newSeance] } : m
      ))
      setNewSeanceTitre(''); setNewSeanceObjectif(''); setNewSeanceDuree(''); setNewSeanceTeacher('')
      setShowSeanceForm(null)
    }
    setSaving(false)
  }

  async function deleteSeance(moduleId: string, seanceId: string) {
    await supabase.from('formation_seances').delete().eq('id', seanceId)
    setModules(prev => prev.map(m =>
      m.id === moduleId ? { ...m, seances: m.seances?.filter(s => s.id !== seanceId) } : m
    ))
  }

  const totalHeures = modules.reduce((sum, m) => {
    const vh = m.seances?.reduce((s, seq) => s + (seq.duree_heures ?? 0), 0) ?? m.volume_horaire ?? 0
    return sum + vh
  }, 0)

  const inputCls = `w-full px-3 py-2 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`

  if (loading) return <div className="p-8 text-sm text-slate-400">Chargement...</div>

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <Link href={`/org/${orgId}/conception/formations/${formationId}`}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-2">
          <ArrowLeft size={13} /> {formation?.title}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Plan pédagogique</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              ISO 21001 §8.3.5 — {modules.length} modules · {totalHeures}h planifiées
            </p>
          </div>
          <button onClick={() => setShowModForm(v => !v)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white
                       rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
            <Plus size={15} /> Ajouter un module
          </button>
        </div>
      </div>

      {/* Formulaire nouveau module */}
      {showModForm && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-4 space-y-3">
          <p className="text-sm font-semibold text-slate-700">Nouveau module</p>
          <div className="grid grid-cols-3 gap-3">
            <input type="text" value={newModCode} onChange={e => setNewModCode(e.target.value)}
              placeholder="Code (ex: M1)" className={inputCls} />
            <input type="text" value={newModTitle} onChange={e => setNewModTitle(e.target.value)}
              placeholder="Intitulé du module *" className={`${inputCls} col-span-2`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={newModType} onChange={e => setNewModType(e.target.value as ModuleType)} className={inputCls}>
              {Object.entries(MODULE_TYPE_META).map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
            <input type="number" value={newModVH} onChange={e => setNewModVH(e.target.value)}
              placeholder="Volume horaire (h)" className={inputCls} />
          </div>
          <div className="flex gap-2">
            <button onClick={addModule} disabled={saving || !newModTitle.trim()}
              className="px-4 py-2 bg-[#1B3A6B] text-white rounded-lg text-sm font-medium
                         hover:bg-[#2E5BA8] disabled:opacity-50">
              Ajouter
            </button>
            <button onClick={() => setShowModForm(false)}
              className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-sm hover:bg-slate-100">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Modules */}
      {modules.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <p className="text-slate-400 text-sm">Aucun module — ajoutez le premier module de la formation.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {modules.map((mod, idx) => {
            const typeMeta  = MODULE_TYPE_META[mod.type]
            const isExpanded = expanded[mod.id] !== false
            const modHeures = mod.seances?.reduce((s, seq) => s + (seq.duree_heures ?? 0), 0) ?? 0

            return (
              <div key={mod.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* Header module */}
                <div className="flex items-center px-4 py-3 gap-3">
                  <GripVertical size={14} className="text-slate-300 shrink-0" />
                  <div className={`shrink-0 px-2 py-0.5 rounded border text-xs font-medium ${typeMeta.cls}`}>
                    {typeMeta.icon} {typeMeta.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {mod.code && (
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {mod.code}
                        </span>
                      )}
                      <p className="text-sm font-semibold text-slate-800">{mod.title}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <Clock size={10} />
                      <span>{modHeures > 0 ? `${modHeures}h` : mod.volume_horaire ? `${mod.volume_horaire}h` : '—'}</span>
                      <span>· {mod.seances?.length ?? 0} séance{(mod.seances?.length ?? 0) > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setExpanded(p => ({ ...p, [mod.id]: !isExpanded }))}
                      className="p-1.5 text-slate-400 hover:text-slate-600">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button onClick={() => deleteModule(mod.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Séances */}
                {isExpanded && (
                  <div className="border-t border-slate-50">
                    {mod.seances && mod.seances.length > 0 && (
                      <div className="divide-y divide-slate-50">
                        {mod.seances.map((seq, si) => {
                          const sMethode = SEANCE_METHODE_META[seq.methode]
                          return (
                            <div key={seq.id} className="flex items-start px-5 py-3 gap-3 group hover:bg-slate-50">
                              <span className="text-xs text-slate-300 font-mono w-5 shrink-0 mt-0.5">{si + 1}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-base">{sMethode.icon}</span>
                                  <p className="text-sm font-medium text-slate-700">{seq.titre}</p>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                  <span>{sMethode.label}</span>
                                  {seq.duree_heures && <span>· {seq.duree_heures}h</span>}
                                  {seq.teacher_name && (
                                    <span className="text-[#1B3A6B]">· {seq.teacher_name}</span>
                                  )}
                                </div>
                                {seq.objectif && (
                                  <p className="text-xs text-slate-500 italic mt-0.5">{seq.objectif}</p>
                                )}
                              </div>
                              <button onClick={() => deleteSeance(mod.id, seq.id)}
                                className="shrink-0 opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Formulaire séance */}
                    {showSeanceForm === mod.id ? (
                      <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" value={newSeanceTitre} onChange={e => setNewSeanceTitre(e.target.value)}
                            placeholder="Intitulé de la séance *" className={inputCls} />
                          <input type="text" value={newSeanceObjectif} onChange={e => setNewSeanceObjectif(e.target.value)}
                            placeholder="Objectif pédagogique" className={inputCls} />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <select value={newSeanceMethode}
                            onChange={e => setNewSeanceMethode(e.target.value as SeanceMethode)}
                            className={inputCls}>
                            {Object.entries(SEANCE_METHODE_META).map(([k, v]) => (
                              <option key={k} value={k}>{v.icon} {v.label}</option>
                            ))}
                          </select>
                          <input type="number" value={newSeanceDuree} onChange={e => setNewSeanceDuree(e.target.value)}
                            placeholder="Durée (h)" className={inputCls} />
                          <select value={newSeanceTeacher} onChange={e => setNewSeanceTeacher(e.target.value)}
                            className={inputCls}>
                            <option value="">— Intervenant —</option>
                            {teachers.map(t => (
                              <option key={t.id} value={t.id}>
                                {t.full_name}{t.sup2i_validated ? ' ✓' : ' ⚠️'}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => addSeance(mod.id)} disabled={saving || !newSeanceTitre.trim()}
                            className="px-4 py-2 bg-[#1B3A6B] text-white rounded-lg text-xs font-medium
                                       hover:bg-[#2E5BA8] disabled:opacity-50">
                            Ajouter la séance
                          </button>
                          <button onClick={() => setShowSeanceForm(null)}
                            className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs hover:bg-slate-100">
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="px-5 py-2 border-t border-slate-50">
                        <button onClick={() => {
                          setShowSeanceForm(mod.id)
                          setNewSeanceTitre(''); setNewSeanceObjectif(''); setNewSeanceDuree('')
                        }}
                          className="text-xs text-[#1B3A6B] hover:underline font-medium flex items-center gap-1">
                          <Plus size={11} /> Ajouter une séance
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
