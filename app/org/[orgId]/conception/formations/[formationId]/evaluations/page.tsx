'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { EVAL_TYPE_META, type EvalType } from '@/lib/conception-templates'
import { ArrowLeft, Plus, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface Eval {
  id: string; titre: string; type: EvalType
  description: string | null; coefficient: number | null
  duree_minutes: number | null; criteres: string | null
  competences_evaluees: string[]
}

export default function EvaluationsPage() {
  const params = useParams<{ orgId: string; formationId: string }>()
  const { orgId, formationId } = params
  const supabase = createClient()

  const [formation,   setFormation]   = useState<any>(null)
  const [evals,       setEvals]       = useState<Eval[]>([])
  const [loading,     setLoading]     = useState(true)
  const [showForm,    setShowForm]    = useState(false)
  const [saving,      setSaving]      = useState(false)

  const [newTitre,    setNewTitre]    = useState('')
  const [newType,     setNewType]     = useState<EvalType>('examen')
  const [newDesc,     setNewDesc]     = useState('')
  const [newCoef,     setNewCoef]     = useState('')
  const [newDuree,    setNewDuree]    = useState('')
  const [newCriteres, setNewCriteres] = useState('')

  useEffect(() => {
    async function load() {
      const [{ data: f }, { data: e }] = await Promise.all([
        supabase.from('formations').select('id, title').eq('id', formationId).single(),
        supabase.from('formation_evaluations').select('*').eq('formation_id', formationId),
      ])
      setFormation(f)
      setEvals((e ?? []) as Eval[])
      setLoading(false)
    }
    load()
  }, [formationId])

  async function addEval() {
    if (!newTitre.trim()) return
    setSaving(true)
    const { data } = await supabase.from('formation_evaluations').insert({
      formation_id:    formationId,
      organization_id: orgId,
      titre:           newTitre.trim(),
      type:            newType,
      description:     newDesc.trim() || null,
      coefficient:     newCoef ? parseFloat(newCoef) : null,
      duree_minutes:   newDuree ? parseInt(newDuree) : null,
      criteres:        newCriteres.trim() || null,
    }).select().single()
    if (data) {
      setEvals(prev => [...prev, data as Eval])
      setNewTitre(''); setNewDesc(''); setNewCoef(''); setNewDuree(''); setNewCriteres('')
      setShowForm(false)
    }
    setSaving(false)
  }

  async function deleteEval(id: string) {
    await supabase.from('formation_evaluations').delete().eq('id', id)
    setEvals(prev => prev.filter(e => e.id !== id))
  }

  const totalCoef = evals.reduce((sum, e) => sum + (e.coefficient ?? 0), 0)
  const coefOk = Math.abs(totalCoef - 1) < 0.01 || totalCoef === 0

  const inputCls = `w-full px-3 py-2 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`

  if (loading) return <div className="p-8 text-sm text-slate-400">Chargement...</div>

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href={`/org/${orgId}/conception/formations/${formationId}`}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-2">
          <ArrowLeft size={13} /> {formation?.title}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Évaluations</h1>
            <p className="text-sm text-slate-400 mt-0.5">ISO 21001 §8.3.5 — Modalités d'évaluation</p>
          </div>
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white
                       rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
            <Plus size={15} /> Ajouter
          </button>
        </div>
      </div>

      {/* Vérification coefficient */}
      {evals.length > 0 && evals.some(e => e.coefficient) && (
        <div className={`rounded-xl border px-4 py-3 mb-5 flex items-center gap-3 ${
          coefOk ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
        }`}>
          {coefOk
            ? <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            : <AlertTriangle size={15} className="text-amber-500 shrink-0" />
          }
          <p className={`text-sm ${coefOk ? 'text-emerald-700' : 'text-amber-700'}`}>
            {coefOk
              ? `Total coefficients : ${totalCoef.toFixed(2)} ✓`
              : `Total coefficients : ${totalCoef.toFixed(2)} — doit être égal à 1`
            }
          </p>
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-4 space-y-3">
          <p className="text-sm font-semibold text-slate-700">Nouvelle évaluation</p>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={newTitre} onChange={e => setNewTitre(e.target.value)}
              placeholder="Intitulé *" className={inputCls} />
            <select value={newType} onChange={e => setNewType(e.target.value as EvalType)} className={inputCls}>
              {Object.entries(EVAL_TYPE_META).map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" step="0.01" value={newCoef} onChange={e => setNewCoef(e.target.value)}
              placeholder="Coefficient (ex: 0.4)" className={inputCls} />
            <input type="number" value={newDuree} onChange={e => setNewDuree(e.target.value)}
              placeholder="Durée (minutes)" className={inputCls} />
          </div>
          <textarea value={newCriteres} onChange={e => setNewCriteres(e.target.value)} rows={3}
            placeholder="Critères d'évaluation et barème..."
            className={`${inputCls} resize-none`} />
          <div className="flex gap-2">
            <button onClick={addEval} disabled={saving || !newTitre.trim()}
              className="px-4 py-2 bg-[#1B3A6B] text-white rounded-lg text-sm font-medium
                         hover:bg-[#2E5BA8] disabled:opacity-50">
              Ajouter
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-sm hover:bg-slate-100">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {evals.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <p className="text-slate-400 text-sm">Aucune évaluation définie</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-50">
          {evals.map(e => {
            const meta = EVAL_TYPE_META[e.type]
            return (
              <div key={e.id} className="flex items-start px-5 py-4 gap-3 group hover:bg-slate-50">
                <span className={`shrink-0 mt-0.5 px-2 py-0.5 rounded border text-xs font-medium whitespace-nowrap ${meta.cls}`}>
                  {meta.icon} {meta.label}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{e.titre}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    {e.coefficient && <span>Coef. <strong>{e.coefficient}</strong></span>}
                    {e.duree_minutes && <span>· {e.duree_minutes} min</span>}
                  </div>
                  {e.criteres && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{e.criteres}</p>
                  )}
                </div>
                <button onClick={() => deleteEval(e.id)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
