'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sparkles } from 'lucide-react'
import {
  SWOT_TEMPLATES,
  PESTEL_TEMPLATES,
  INTERESTED_PARTIES_TEMPLATES,
} from '@/lib/context-templates'

export default function ContextSeeder({ orgId }: { orgId: string }) {
  const router   = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [result,  setResult]  = useState('')

  async function seed() {
    if (!confirm('Pré-remplir le contexte avec les modèles SUP2I ?\nSeuls les sections vides seront remplies.')) return
    setLoading(true)

    // Vérifier ce qui existe déjà
    const [
      { count: swotCount },
      { count: pestelCount },
      { count: piCount },
    ] = await Promise.all([
      supabase.from('swot_items').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
      supabase.from('pestel_items').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
      supabase.from('interested_parties').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    ])

    const added: string[] = []

    // SWOT — seulement si vide
    if (!swotCount || swotCount === 0) {
      const swotRows = Object.entries(SWOT_TEMPLATES).flatMap(([quadrant, items]) =>
        items.map((content, i) => ({ organization_id: orgId, quadrant, content, sort_order: i }))
      )
      await supabase.from('swot_items').insert(swotRows)
      added.push(`${swotRows.length} SWOT`)
    }

    // PESTEL — seulement si vide
    if (!pestelCount || pestelCount === 0) {
      const pestelRows = PESTEL_TEMPLATES.map(t => ({
        organization_id: orgId,
        dimension: t.dimension,
        content:   t.content,
        impact:    t.impact,
      }))
      await supabase.from('pestel_items').insert(pestelRows)
      added.push(`${pestelRows.length} PESTEL`)
    }

    // Parties intéressées — seulement si vide
    if (!piCount || piCount === 0) {
      const piRows = INTERESTED_PARTIES_TEMPLATES.map(t => ({
        organization_id: orgId,
        name:            t.name,
        category:        t.category,
        group_key:       t.group,
        needs:           t.needs,
        expectations:    t.expectations,
        influence_level: t.influence_level,
        interest_level:  t.interest_level,
      }))
      await supabase.from('interested_parties').insert(piRows)
      added.push(`${piRows.length} PI`)
    }

    setLoading(false)

    if (added.length === 0) {
      setResult('Tout est déjà rempli — aucun ajout effectué.')
    } else {
      setResult(`Ajouté : ${added.join(', ')}`)
      setDone(true)
    }

    router.refresh()
    setTimeout(() => setResult(''), 4000)
  }

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
          {result}
        </span>
      )}
      <button
        onClick={seed}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white
                   rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors
                   disabled:opacity-50"
      >
        <Sparkles size={15} />
        {loading ? 'Chargement...' : 'Pré-remplir depuis modèle SUP2I'}
      </button>
    </div>
  )
}
