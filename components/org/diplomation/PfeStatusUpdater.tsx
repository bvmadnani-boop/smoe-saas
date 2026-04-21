'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const STATUS_OPTIONS = [
  { value: 'pending',     label: 'En attente',  cls: 'bg-slate-100 text-slate-500' },
  { value: 'in_progress', label: 'En cours',    cls: 'bg-blue-50 text-blue-600' },
  { value: 'submitted',   label: 'Soumis',      cls: 'bg-violet-50 text-violet-600' },
  { value: 'defended',    label: 'Soutenu',     cls: 'bg-amber-50 text-amber-600' },
  { value: 'validated',   label: 'Validé',      cls: 'bg-emerald-50 text-emerald-600' },
  { value: 'rejected',    label: 'Rejeté',      cls: 'bg-red-50 text-red-500' },
]

export default function PfeStatusUpdater({
  pfeId, currentStatus, currentGrade,
}: {
  pfeId: string
  currentStatus: string
  currentGrade: number | null
}) {
  const router   = useRouter()
  const supabase = createClient()
  const [status, setStatus]   = useState(currentStatus)
  const [grade,  setGrade]    = useState(currentGrade?.toString() ?? '')
  const [loading, setLoading] = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')

  async function save() {
    setLoading(true); setError(''); setSaved(false)

    const gradeVal = grade !== '' ? parseFloat(grade) : null
    if (gradeVal !== null && (gradeVal < 0 || gradeVal > 20)) {
      setError('La note doit être entre 0 et 20.')
      setLoading(false); return
    }

    const { error: err } = await supabase
      .from('pfe_projects')
      .update({ status, grade: gradeVal })
      .eq('id', pfeId)

    if (err) { setError(err.message); setLoading(false); return }
    setSaved(true)
    setLoading(false)
    router.refresh()
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <h3 className="font-semibold text-slate-800 text-sm">Statut & Note</h3>

      {/* Statut */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Statut du projet</label>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => setStatus(o.value)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                status === o.value
                  ? o.cls + ' border-current shadow-sm scale-[1.03]'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Note finale <span className="text-slate-400 font-normal">(sur 20)</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number" min="0" max="20" step="0.25"
            value={grade}
            onChange={e => setGrade(e.target.value)}
            placeholder="—"
            className="w-28 px-3 py-2 border border-slate-300 rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
          />
          {grade !== '' && (
            <span className={`text-sm font-bold px-3 py-1.5 rounded-lg ${
              parseFloat(grade) >= 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
            }`}>
              {parseFloat(grade) >= 10 ? 'Admis' : 'Ajourné'}
            </span>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <button
        type="button"
        onClick={save}
        disabled={loading}
        className="px-5 py-2 bg-[#1B3A6B] text-white rounded-lg text-sm font-medium
                   hover:bg-[#2E5BA8] transition-colors disabled:opacity-50"
      >
        {loading ? 'Enregistrement...' : saved ? '✓ Enregistré' : 'Enregistrer'}
      </button>
    </div>
  )
}
