'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ANEAQ_POSITIONS, ANEAQ_FICHES } from '@/lib/support-templates'
import { FileText, Loader2 } from 'lucide-react'

const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ')

const TITLE_TO_KEY: Record<string, string> = Object.fromEntries(
  ANEAQ_POSITIONS.map(p => [normalize(p.title), p.key])
)
const LEVEL_ORDER_TO_KEY: Record<string, string> = Object.fromEntries(
  ANEAQ_POSITIONS.map(p => [`${p.level}-${p.order_index}`, p.key])
)

function resolveKey(title: string, level?: number, order_index?: number): string | null {
  const byTitle = TITLE_TO_KEY[normalize(title)]
  if (byTitle) return byTitle
  if (level != null && order_index != null) {
    return LEVEL_ORDER_TO_KEY[`${level}-${order_index}`] ?? null
  }
  return null
}

type PositionNeedsFiche = {
  id: string
  title: string
  level: number
  order_index: number
}

export default function FicheSeeder({ orgId }: { orgId: string }) {
  const router   = useRouter()
  const supabase = createClient()

  const [positions, setPositions] = useState<PositionNeedsFiche[]>([])
  const [checked,   setChecked]   = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    async function detect() {
      // Requête 1 : tous les postes (sans filtre is_active pour ne rien rater)
      const { data: allPositions } = await supabase
        .from('org_positions')
        .select('id, title, level, order_index')
        .eq('organization_id', orgId)

      if (!allPositions?.length) { setChecked(true); return }

      // Requête 2 : toutes les fiches existantes pour cet org
      const { data: allFiches } = await supabase
        .from('org_fiches_fonction')
        .select('id, position_id, role_description, missions')
        .eq('organization_id', orgId)

      const ficheByPos: Record<string, any> = {}
      for (const f of (allFiches ?? [])) {
        ficheByPos[f.position_id] = f
      }

      const needsFiche = allPositions
        .filter(pos => {
          const f = ficheByPos[pos.id]
          if (!f) return true   // pas de fiche du tout
          // fiche vide : pas de role ET pas de missions
          return !f.role_description && (!f.missions || (f.missions as string[]).length === 0)
        })
        .map(pos => ({
          id:          pos.id,
          title:       pos.title,
          level:       pos.level,
          order_index: pos.order_index,
        }))

      setPositions(needsFiche)
      setChecked(true)
    }
    detect()
  }, [orgId])

  const matchables = positions.filter(p => {
    const key = resolveKey(p.title, p.level, p.order_index)
    return key && ANEAQ_FICHES[key]
  })

  if (!checked || positions.length === 0 || done) return null

  async function handleSeed() {
    setLoading(true)
    setError('')

    const payload = matchables.map(p => {
      const key   = resolveKey(p.title, p.level, p.order_index)!
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

    if (payload.length === 0) { setLoading(false); return }

    const { error: err } = await supabase
      .from('org_fiches_fonction')
      .upsert(payload, { onConflict: 'position_id' })

    if (err) { setError(err.message); setLoading(false); return }

    setDone(true)
    setLoading(false)
    router.refresh()
  }

  const nonMatchables = positions.filter(p => {
    const key = resolveKey(p.title, p.level, p.order_index)
    return !key || !ANEAQ_FICHES[key]
  })

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <FileText size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {positions.length} fiche{positions.length > 1 ? 's' : ''} à compléter
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
          {nonMatchables.length} poste{nonMatchables.length > 1 ? 's' : ''} hors modèle — à rédiger manuellement :{' '}
          {nonMatchables.map(p => p.title).join(', ')}
        </p>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
