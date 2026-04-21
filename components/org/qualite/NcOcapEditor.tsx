'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { NC_STATUS_META } from '@/lib/nc-ocap-templates'

type NcStatus = 'ouverte' | 'en_cours' | 'cloturee' | 'rejetee'

export default function NcOcapEditor({
  ncId,
  currentStatus,
  currentVersion,
  ocap,
}: {
  ncId: string
  currentStatus: NcStatus
  currentVersion: number
  ocap: {
    containment: string | null
    cause:       string | null
    plan:        string | null
    responsible: string | null
    deadline:    string | null
    evidence:    string | null
    effective:   boolean | null
  }
}) {
  const router   = useRouter()
  const supabase = createClient()

  const [status,    setStatus]    = useState<NcStatus>(currentStatus)
  const [containment, setContainment] = useState(ocap.containment ?? '')
  const [cause,     setCause]     = useState(ocap.cause ?? '')
  const [plan,      setPlan]      = useState(ocap.plan ?? '')
  const [responsible, setResponsible] = useState(ocap.responsible ?? '')
  const [deadline,  setDeadline]  = useState(ocap.deadline ?? '')
  const [evidence,  setEvidence]  = useState(ocap.evidence ?? '')
  const [effective, setEffective] = useState(ocap.effective ?? false)
  const [loading,   setLoading]   = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [error,     setError]     = useState('')

  async function save() {
    setLoading(true); setError(''); setSaved(false)

    const updates: Record<string, any> = {
      status,
      ocap_containment: containment.trim() || null,
      ocap_cause:       cause.trim() || null,
      ocap_plan:        plan.trim() || null,
      ocap_responsible: responsible.trim() || null,
      ocap_deadline:    deadline || null,
      ocap_evidence:    evidence.trim() || null,
      ocap_effective:   effective,
      version:          currentVersion + 1,
      updated_at:       new Date().toISOString(),
    }

    if (status === 'cloturee' && !updates.closed_at) {
      updates.closed_at = new Date().toISOString()
    }

    const { error: err } = await supabase
      .from('nonconformities')
      .update(updates)
      .eq('id', ncId)

    if (err) { setError(err.message); setLoading(false); return }
    setSaved(true)
    setLoading(false)
    router.refresh()
    setTimeout(() => setSaved(false), 2500)
  }

  const textareaCls = `w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent resize-none`
  const inputCls = `w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`
  const labelCls = `block text-sm font-medium text-slate-700 mb-1`

  return (
    <div className="space-y-4">

      {/* Statut */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 text-sm mb-3">Statut NC</h3>
        <div className="flex gap-2 flex-wrap">
          {(Object.entries(NC_STATUS_META) as [NcStatus, {label:string;cls:string}][]).map(([key, meta]) => (
            <button
              key={key} type="button"
              onClick={() => setStatus(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                status === key
                  ? meta.cls + ' border-current shadow-sm scale-[1.02]'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {meta.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">Version actuelle : v{currentVersion}</p>
      </div>

      {/* OCAP Editor */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="font-semibold text-slate-800 text-sm">OCAP</h3>

        <div>
          <label className={labelCls}>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">C</span>
              Containment
            </span>
          </label>
          <textarea value={containment} onChange={e => setContainment(e.target.value)}
            rows={3} className={textareaCls} />
        </div>

        <div>
          <label className={labelCls}>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">A</span>
              Analyse cause racine
            </span>
          </label>
          <textarea value={cause} onChange={e => setCause(e.target.value)}
            rows={3} className={textareaCls} />
        </div>

        <div>
          <label className={labelCls}>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">P</span>
              Plan correctif
            </span>
          </label>
          <textarea value={plan} onChange={e => setPlan(e.target.value)}
            rows={3} className={textareaCls} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Responsable</label>
            <input type="text" value={responsible}
              onChange={e => setResponsible(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Délai prévu</label>
            <input type="date" value={deadline}
              onChange={e => setDeadline(e.target.value)} className={inputCls} />
          </div>
        </div>

        {/* Clôture */}
        {(status === 'cloturee') && (
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div>
              <label className={labelCls}>Preuve de clôture</label>
              <textarea value={evidence} onChange={e => setEvidence(e.target.value)}
                rows={2} placeholder="Description de la preuve, référence document..."
                className={textareaCls} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={effective}
                onChange={e => setEffective(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600
                           focus:ring-emerald-500 cursor-pointer" />
              <span className="text-sm text-slate-700">Efficacité de l'action vérifiée</span>
            </label>
          </div>
        )}

        {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <button type="button" onClick={save} disabled={loading}
          className="w-full py-2 bg-[#1B3A6B] text-white rounded-lg text-sm font-medium
                     hover:bg-[#2E5BA8] transition-colors disabled:opacity-50">
          {loading ? 'Enregistrement...' : saved ? '✓ Sauvegardé' : 'Enregistrer les modifications'}
        </button>
      </div>
    </div>
  )
}
