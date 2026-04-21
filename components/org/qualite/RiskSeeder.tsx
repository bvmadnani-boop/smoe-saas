'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RISK_TEMPLATES } from '@/lib/risk-templates'
import { Sparkles, Loader2 } from 'lucide-react'

export default function RiskSeeder({
  orgId,
  onDone,
}: {
  orgId: string
  onDone: () => void
}) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function seed() {
    setLoading(true); setError('')
    try {
      const rows = RISK_TEMPLATES.map(t => ({
        organization_id:  orgId,
        type:             t.type,
        category:         t.category,
        title:            t.title,
        description:      t.description,
        probability:      t.probability,
        impact:           t.impact,
        treatment:        t.treatment,
        treatment_action: t.treatment_action,
        status:           'identifie',
        version:          1,
      }))

      const { error: err } = await supabase.from('risks').insert(rows)
      if (err) throw err
      onDone()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const rCount = RISK_TEMPLATES.filter(t => t.type === 'risque').length
  const oCount = RISK_TEMPLATES.filter(t => t.type === 'opportunite').length

  return (
    <div className="bg-violet-50 border border-violet-200 rounded-xl p-5 mb-6">
      <div className="flex items-start gap-3">
        <Sparkles size={20} className="text-violet-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-violet-900 text-sm">
            Pré-remplir votre registre Risques & Opportunités
          </p>
          <p className="text-violet-700 text-xs mt-1 leading-relaxed">
            {rCount} risques + {oCount} opportunités pré-établis pour les établissements d'enseignement supérieur —
            catégorisés, scorés et avec actions de traitement suggérées.
            Vous pouvez tout modifier après.
          </p>
          {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
        </div>
        <button
          onClick={seed}
          disabled={loading}
          className="shrink-0 flex items-center gap-2 px-4 py-2 bg-violet-600 text-white
                     rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors
                     disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {loading ? 'Chargement...' : 'Pré-remplir'}
        </button>
      </div>
    </div>
  )
}
