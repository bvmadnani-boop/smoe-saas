'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ANEAQ_POSITIONS, ANEAQ_FICHES } from '@/lib/support-templates'
import { Loader2, Wand2 } from 'lucide-react'

const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ')
const TITLE_TO_KEY: Record<string, string> = Object.fromEntries(
  ANEAQ_POSITIONS.map(p => [normalize(p.title), p.key])
)
const LEVEL_ORDER_TO_KEY: Record<string, string> = Object.fromEntries(
  ANEAQ_POSITIONS.map(p => [`${p.level}-${p.order_index}`, p.key])
)

export default function FicheSeeder({ orgId }: { orgId: string }) {
  const router   = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState('')

  async function handleSeed() {
    if (!confirm('Pré-remplir les fiches de fonction avec le modèle ANEAQ ?\n\nSeules les fiches vides seront remplies.')) return
    setLoading(true)
    setError('')

    // 1. Récupérer tous les postes de l'org
    const { data: allPositions, error: e1 } = await supabase
      .from('org_positions')
      .select('id, title, level, order_index')
      .eq('organization_id', orgId)

    if (e1 || !allPositions?.length) {
      setError(e1?.message ?? 'Aucun poste trouvé')
      setLoading(false)
      return
    }

    // 2. Récupérer les fiches existantes
    const { data: existingFiches } = await supabase
      .from('org_fiches_fonction')
      .select('position_id, role_description, missions')
      .eq('organization_id', orgId)

    const existingByPos: Record<string, { role_description: string | null; missions: string[] | null }> = {}
    for (const f of (existingFiches ?? [])) {
      existingByPos[f.position_id] = f
    }

    // 3. Construire le payload — uniquement les postes sans fiche utile
    const payload = allPositions
      .filter(pos => {
        const existing = existingByPos[pos.id]
        if (!existing) return true // pas de fiche
        return !existing.role_description && (!existing.missions || existing.missions.length === 0)
      })
      .map(pos => {
        const key = TITLE_TO_KEY[normalize(pos.title)]
          ?? LEVEL_ORDER_TO_KEY[`${pos.level}-${pos.order_index}`]
        if (!key || !ANEAQ_FICHES[key]) return null
        const fiche = ANEAQ_FICHES[key]
        return {
          organization_id:      orgId,
          position_id:          pos.id,
          role_description:     fiche.role_description,
          missions:             fiche.missions,
          responsabilites:      fiche.responsabilites,
          taches:               fiche.taches,
          exigences_diplome:    fiche.exigences_diplome,
          exigences_experience: fiche.exigences_experience,
          version:              '1.0',
        }
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)

    if (payload.length === 0) {
      setDone(true)
      setLoading(false)
      router.refresh()
      return
    }

    const { error: e2 } = await supabase
      .from('org_fiches_fonction')
      .upsert(payload, { onConflict: 'position_id' })

    if (e2) { setError(e2.message); setLoading(false); return }

    setDone(true)
    setLoading(false)
    router.refresh()
  }

  if (done) return (
    <span className="text-xs text-emerald-600 font-medium">✓ Fiches initialisées</span>
  )

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleSeed}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 text-slate-600
                   rounded-lg text-xs font-medium hover:border-[#1B3A6B] hover:text-[#1B3A6B]
                   transition-colors disabled:opacity-50 bg-white"
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
        {loading ? 'Initialisation...' : 'Fiches ANEAQ'}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
