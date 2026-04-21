'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  RISK_CATEGORIES, RISK_TREATMENT_META,
  getScoreLevel,
  type RiskType, type RiskCategory, type RiskTreatment, type RiskStatus,
} from '@/lib/risk-templates'
import { X, Save, Trash2 } from 'lucide-react'

interface Risk {
  id: string
  type: RiskType
  category: RiskCategory
  title: string
  description: string | null
  probability: number
  impact: number
  score: number
  treatment: RiskTreatment | null
  treatment_action: string | null
  owner: string | null
  status: RiskStatus
  version: number
}

export default function RiskEditor({
  orgId,
  risk,
  onClose,
}: {
  orgId: string
  risk?: Risk | null  // null = new
  onClose: () => void
}) {
  const router   = useRouter()
  const supabase = createClient()

  const [type,       setType]       = useState<RiskType>(risk?.type ?? 'risque')
  const [category,   setCategory]   = useState<RiskCategory>(risk?.category ?? 'pedagogique')
  const [title,      setTitle]      = useState(risk?.title ?? '')
  const [description, setDesc]      = useState(risk?.description ?? '')
  const [prob,       setProb]       = useState(risk?.probability ?? 3)
  const [impact,     setImpact]     = useState(risk?.impact ?? 3)
  const [treatment,  setTreatment]  = useState<RiskTreatment | ''>(risk?.treatment ?? '')
  const [action,     setAction]     = useState(risk?.treatment_action ?? '')
  const [owner,      setOwner]      = useState(risk?.owner ?? '')
  const [status,     setStatus]     = useState<RiskStatus>(risk?.status ?? 'identifie')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')

  const score     = prob * impact
  const scoreMeta = getScoreLevel(score)

  const inputCls = `w-full px-3 py-2 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`

  const availableTreatments = Object.entries(RISK_TREATMENT_META)
    .filter(([, v]) => v.forType.includes(type))

  async function save() {
    if (!title.trim()) { setError('Le titre est obligatoire.'); return }
    setLoading(true); setError('')

    const payload = {
      organization_id:  orgId,
      type,
      category,
      title:            title.trim(),
      description:      description.trim() || null,
      probability:      prob,
      impact,
      treatment:        treatment || null,
      treatment_action: action.trim() || null,
      owner:            owner.trim() || null,
      status,
    }

    if (risk) {
      const { error: err } = await supabase
        .from('risks')
        .update({ ...payload, version: risk.version + 1, updated_at: new Date().toISOString() })
        .eq('id', risk.id)
      if (err) { setError(err.message); setLoading(false); return }
    } else {
      const { error: err } = await supabase.from('risks').insert({ ...payload, version: 1 })
      if (err) { setError(err.message); setLoading(false); return }
    }

    router.refresh()
    onClose()
  }

  async function remove() {
    if (!risk) return
    if (!confirm('Supprimer ce risque ?')) return
    setLoading(true)
    await supabase.from('risks').delete().eq('id', risk.id)
    router.refresh()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">
            {risk ? 'Modifier le risque' : 'Nouveau risque / opportunité'}
          </h2>
          <button onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Type */}
          <div className="flex gap-3">
            {(['risque', 'opportunite'] as RiskType[]).map(t => (
              <button key={t} type="button"
                onClick={() => { setType(t); setTreatment('') }}
                className={`flex-1 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                  type === t
                    ? t === 'risque'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {t === 'risque' ? '⚠️ Risque' : '✨ Opportunité'}
              </button>
            ))}
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Catégorie</label>
            <div className="grid grid-cols-4 gap-2">
              {RISK_CATEGORIES.map(c => (
                <button key={c.key} type="button"
                  onClick={() => setCategory(c.key)}
                  className={`px-2 py-2 rounded-lg border text-xs font-medium transition-all text-center ${
                    category === c.key
                      ? 'bg-[#1B3A6B] border-[#1B3A6B] text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="block text-base mb-0.5">{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Titre <span className="text-red-500">*</span>
            </label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Non-conformité des contenus aux référentiels SUP2I" className={inputCls} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={description} onChange={e => setDesc(e.target.value)} rows={3}
              placeholder="Décrire le risque ou l'opportunité et son contexte..." className={`${inputCls} resize-none`} />
          </div>

          {/* Scoring */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Scoring — Score : <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold border ${scoreMeta.cls}`}>
                {score} · {scoreMeta.label}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Probabilité — {prob}/5</label>
                <input type="range" min={1} max={5} value={prob} onChange={e => setProb(+e.target.value)}
                  className="w-full accent-[#1B3A6B]" />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>Très faible</span><span>Quasi-certaine</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Impact — {impact}/5</label>
                <input type="range" min={1} max={5} value={impact} onChange={e => setImpact(+e.target.value)}
                  className="w-full accent-[#1B3A6B]" />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>Négligeable</span><span>Catastrophique</span>
                </div>
              </div>
            </div>
          </div>

          {/* Traitement */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Traitement</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {availableTreatments.map(([key, meta]) => (
                <button key={key} type="button"
                  onClick={() => setTreatment(key as RiskTreatment)}
                  className={`px-2 py-2 rounded-lg border text-xs transition-all ${
                    treatment === key
                      ? 'bg-[#1B3A6B] border-[#1B3A6B] text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="font-semibold">{meta.label}</div>
                  <div className={`text-[10px] mt-0.5 leading-tight ${treatment === key ? 'text-blue-200' : 'text-slate-400'}`}>
                    {meta.desc}
                  </div>
                </button>
              ))}
            </div>
            <textarea value={action} onChange={e => setAction(e.target.value)} rows={3}
              placeholder="Décrire les actions de traitement concrètes..."
              className={`${inputCls} resize-none`} />
          </div>

          {/* Responsable + Statut */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Responsable</label>
              <input type="text" value={owner} onChange={e => setOwner(e.target.value)}
                placeholder="Nom du responsable" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
              <select value={status} onChange={e => setStatus(e.target.value as RiskStatus)}
                className={inputCls}>
                <option value="identifie">Identifié</option>
                <option value="en_traitement">En traitement</option>
                <option value="clos">Clos</option>
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <button onClick={save} disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white rounded-lg
                         text-sm font-medium hover:bg-[#2E5BA8] transition-colors disabled:opacity-50">
              <Save size={15} />
              {loading ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
            <button onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">
              Annuler
            </button>
            {risk && (
              <button onClick={remove} disabled={loading}
                className="ml-auto flex items-center gap-1.5 px-4 py-2.5 text-red-500
                           hover:bg-red-50 rounded-lg text-sm transition-colors">
                <Trash2 size={14} />
                Supprimer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
