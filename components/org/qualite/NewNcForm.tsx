'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  NC_OCAP_TEMPLATES,
  NC_CATEGORY_META,
  NC_SEVERITY_META,
  type NcCategory,
} from '@/lib/nc-ocap-templates'

export default function NewNcForm({ orgId }: { orgId: string }) {
  const router   = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const [category,  setCategory]  = useState<NcCategory>('p4_pedagogique')
  const [subtype,   setSubtype]   = useState('')
  const [severity,  setSeverity]  = useState<'majeure' | 'mineure' | 'observation'>('mineure')
  const [source,    setSource]    = useState('manuel')
  const [title,     setTitle]     = useState('')
  const [description, setDescription] = useState('')
  const [detectedAt,  setDetectedAt]  = useState(new Date().toISOString().slice(0, 10))
  const [ocapContainment, setOcapContainment] = useState('')
  const [ocapCause,       setOcapCause]       = useState('')
  const [ocapPlan,        setOcapPlan]        = useState('')
  const [ocapResponsible, setOcapResponsible] = useState('')
  const [ocapDeadline,    setOcapDeadline]    = useState('')

  // Pré-remplissage OCAP quand un sous-type est sélectionné
  useEffect(() => {
    if (!subtype) return
    const templates = NC_OCAP_TEMPLATES[category] ?? []
    const tpl = templates.find(t => t.key === subtype)
    if (tpl) {
      setTitle(tpl.defaultTitle)
      setSeverity(tpl.defaultSeverity)
      setOcapContainment(tpl.ocap_containment)
      setOcapCause(tpl.ocap_cause)
      setOcapPlan(tpl.ocap_plan)
    }
  }, [subtype, category])

  // Reset subtype quand catégorie change
  useEffect(() => {
    setSubtype('')
    setTitle('')
    setOcapContainment('')
    setOcapCause('')
    setOcapPlan('')
  }, [category])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Le titre est obligatoire.'); return }

    setLoading(true); setError('')

    const { error: err } = await supabase.from('nonconformities').insert({
      organization_id:  orgId,
      title:            title.trim(),
      category,
      severity,
      source,
      status:           'ouverte',
      description:      description.trim() || null,
      detected_at:      detectedAt,
      ocap_containment: ocapContainment.trim() || null,
      ocap_cause:       ocapCause.trim() || null,
      ocap_plan:        ocapPlan.trim() || null,
      ocap_responsible: ocapResponsible.trim() || null,
      ocap_deadline:    ocapDeadline || null,
      version:          1,
    })

    if (err) { setError(err.message); setLoading(false); return }
    router.push(`/org/${orgId}/qualite/non-conformites`)
    router.refresh()
  }

  const inputCls = `w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`
  const textareaCls = `w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent resize-none`
  const labelCls = `block text-sm font-medium text-slate-700 mb-1`

  const categories = Object.entries(NC_CATEGORY_META) as [NcCategory, typeof NC_CATEGORY_META[NcCategory]][]
  const subtypes   = NC_OCAP_TEMPLATES[category] ?? []

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Catégorie */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="font-semibold text-slate-800 text-sm">1. Classification</h2>

        <div>
          <label className={labelCls}>Catégorie <span className="text-red-500">*</span></label>
          <div className="flex gap-2 flex-wrap">
            {categories.map(([key, meta]) => (
              <button
                key={key} type="button"
                onClick={() => setCategory(key)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  category === key
                    ? meta.badgeCls + ' shadow-sm scale-[1.02]'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {meta.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sous-type avec pré-remplissage OCAP */}
        {subtypes.length > 0 && (
          <div>
            <label className={labelCls}>
              Type de NC
              <span className="ml-2 text-xs text-blue-500 font-normal">
                → Sélectionner pour pré-remplir l'OCAP automatiquement
              </span>
            </label>
            <select value={subtype} onChange={e => setSubtype(e.target.value)} className={inputCls}>
              <option value="">— Choisir un type (ou saisir librement) —</option>
              {subtypes.map(t => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Gravité */}
        <div>
          <label className={labelCls}>Gravité <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            {(Object.entries(NC_SEVERITY_META) as [string, {label:string;cls:string}][]).map(([key, meta]) => (
              <button
                key={key} type="button"
                onClick={() => setSeverity(key as any)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  severity === key
                    ? meta.cls + ' shadow-sm scale-[1.02]'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {meta.label}
              </button>
            ))}
          </div>
        </div>

        {/* Source + Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Source de détection</label>
            <select value={source} onChange={e => setSource(e.target.value)} className={inputCls}>
              <option value="manuel">Manuel</option>
              <option value="audit">Audit interne</option>
              <option value="reclamation">Réclamation</option>
              <option value="automatique">Automatique système</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Date de détection</label>
            <input type="date" value={detectedAt}
              onChange={e => setDetectedAt(e.target.value)} className={inputCls} />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="font-semibold text-slate-800 text-sm">2. Description de la NC</h2>
        <div>
          <label className={labelCls}>Titre <span className="text-red-500">*</span></label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Décrire brièvement la non-conformité..." className={inputCls} required />
        </div>
        <div>
          <label className={labelCls}>Détails / Observations</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            rows={3} placeholder="Contexte, faits observés, personnes impliquées..."
            className={textareaCls} />
        </div>
      </div>

      {/* OCAP */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-semibold text-slate-800 text-sm">3. OCAP — Out of Control Action Plan</h2>
          {subtype && (
            <span className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">
              Pré-rempli automatiquement
            </span>
          )}
        </div>

        <div>
          <label className={labelCls}>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">C</span>
              Containment — Action immédiate
            </span>
          </label>
          <textarea value={ocapContainment} onChange={e => setOcapContainment(e.target.value)}
            rows={3} placeholder="Que faire immédiatement pour limiter l'impact ?"
            className={textareaCls} />
        </div>

        <div>
          <label className={labelCls}>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">A</span>
              Analyse — Cause racine
            </span>
          </label>
          <textarea value={ocapCause} onChange={e => setOcapCause(e.target.value)}
            rows={3} placeholder="Quelle est la cause racine de cette non-conformité ?"
            className={textareaCls} />
        </div>

        <div>
          <label className={labelCls}>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">P</span>
              Plan — Action corrective permanente
            </span>
          </label>
          <textarea value={ocapPlan} onChange={e => setOcapPlan(e.target.value)}
            rows={3} placeholder="Quelles actions pour éviter la récurrence ?"
            className={textareaCls} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Responsable OCAP</label>
            <input type="text" value={ocapResponsible}
              onChange={e => setOcapResponsible(e.target.value)}
              placeholder="Nom / Poste" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Délai de clôture prévu</label>
            <input type="date" value={ocapDeadline}
              onChange={e => setOcapDeadline(e.target.value)} className={inputCls} />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-[#1B3A6B] text-white rounded-lg text-sm font-medium
                     hover:bg-[#2E5BA8] transition-colors disabled:opacity-50">
          {loading ? 'Enregistrement...' : 'Ouvrir la NC'}
        </button>
        <a href={`/org/${orgId}/qualite/non-conformites`}
          className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
          Annuler
        </a>
      </div>
    </form>
  )
}
