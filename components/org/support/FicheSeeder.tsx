'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ANEAQ_POSITIONS, ANEAQ_FICHES } from '@/lib/support-templates'
import { FileText, Loader2 } from 'lucide-react'

// Map titre → clé ANEAQ (pour retrouver la fiche template à partir du titre stocké en DB)
const TITLE_TO_KEY: Record<string, string> = Object.fromEntries(
  ANEAQ_POSITIONS.map(p => [p.title, p.key])
)

type PositionStub = { id: string; title: string }

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

  // Filtre : uniquement les postes dont le titre correspond à un template ANEAQ
  const matchables = positionsSansFiche.filter(p => {
    const key = TITLE_TO_KEY[p.title]
    return key && ANEAQ_FICHES[key]
  })

  if (matchables.length === 0) return null

  async function handleSeed() {
    setLoading(true)
    setError('')
    setDone(false)

    const payload = matchables.map(p => {
      const key   = TITLE_TO_KEY[p.title]
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

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        <FileText size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">
            {matchables.length} fiche{matchables.length > 1 ? 's' : ''} manquante{matchables.length > 1 ? 's' : ''}
          </p>
          <p className="text-xs text-amber-600 mt-0.5">
            {matchables.map(p => p.title).join(' · ')}
          </p>
        </div>
      </div>
      <button
        onClick={handleSeed}
        disabled={loading}
        className="shrink-0 flex items-center gap-2 px-4 py-2 bg-amber-600 text-white
                   rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
        {loading ? 'En cours...' : 'Renseigner les fiches manquantes'}
      </button>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}
