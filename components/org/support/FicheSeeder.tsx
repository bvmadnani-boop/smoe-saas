'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ANEAQ_POSITIONS, ANEAQ_FICHES } from '@/lib/support-templates'
import { FileText, Loader2 } from 'lucide-react'

// Map titre normalisé → clé ANEAQ (insensible aux espaces et à la casse)
const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ')
const TITLE_TO_KEY: Record<string, string> = Object.fromEntries(
  ANEAQ_POSITIONS.map(p => [normalize(p.title), p.key])
)

// Matching par niveau + order_index en fallback
const LEVEL_ORDER_TO_KEY: Record<string, string> = Object.fromEntries(
  ANEAQ_POSITIONS.map(p => [`${p.level}-${p.order_index}`, p.key])
)

type PositionStub = { id: string; title: string; level?: number; order_index?: number }

function resolveKey(p: PositionStub): string | null {
  // 1. Correspondance par titre normalisé
  const byTitle = TITLE_TO_KEY[normalize(p.title)]
  if (byTitle) return byTitle
  // 2. Fallback : niveau + order_index
  if (p.level != null && p.order_index != null) {
    return LEVEL_ORDER_TO_KEY[`${p.level}-${p.order_index}`] ?? null
  }
  return null
}

export default function FicheSeeder({
  orgId,
  positionsSansFiche,
}: {
  orgId: string
  positionsSansFiche: PositionStub[]
}) {
  const router   = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState('')

  const matchables = positionsSansFiche.filter(p => {
    const key = resolveKey(p)
    return key && ANEAQ_FICHES[key]
  })

  // Afficher le bandeau dès qu'il y a des postes sans fiche
  if (positionsSansFiche.length === 0) return null

  async function handleSeed() {
    setLoading(true)
    setError('')
    setDone(false)

    const payload = matchables.map(p => {
      const key   = resolveKey(p)!
      const fiche = ANEAQ_FICHES[key]
      return {
        organization_id:      orgId,
        position_id:          p.id,
        role_description:     fiche.role_description,
        missions:             fiche.missions,
        responsabilites:      fiche.responsabilites,
        taches:               fiche.taches,
        exigences_diplome:    fiche.exigences_diplome,
        exigences_experience: fiche.exigences_experience,
        version:              '1.0',
      }
    })

    const { error: err } = await supabase.from('org_fiches_fonction').insert(payload)

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
    router.refresh()
  }

  if (done) return null

  const nonMatchables = positionsSansFiche.filter(p => !resolveKey(p) || !ANEAQ_FICHES[resolveKey(p)!])

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <FileText size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {positionsSansFiche.length} fiche{positionsSansFiche.length > 1 ? 's' : ''} manquante{positionsSansFiche.length > 1 ? 's' : ''}
              {matchables.length > 0 && ` · ${matchables.length} avec template ANEAQ`}
            </p>
            {matchables.length > 0 && (
              <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
                {matchables.map(p => p.title).join(' · ')}
              </p>
            )}
          </div>
        </div>
        {matchables.length > 0 && (
          <button
            onClick={handleSeed}
            disabled={loading}
            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-amber-600 text-white
                       rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            {loading ? 'En cours...' : `Pré-remplir ${matchables.length} fiche${matchables.length > 1 ? 's' : ''}`}
          </button>
        )}
      </div>

      {nonMatchables.length > 0 && (
        <p className="text-xs text-amber-700 border-t border-amber-200 pt-2">
          {nonMatchables.length} poste{nonMatchables.length > 1 ? 's' : ''} hors modèle ANEAQ à rédiger manuellement :{' '}
          {nonMatchables.map(p => p.title).join(', ')}
        </p>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
