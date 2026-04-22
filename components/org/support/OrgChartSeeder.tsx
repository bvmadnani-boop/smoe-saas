'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ANEAQ_POSITIONS } from '@/lib/support-templates'
import { Loader2 } from 'lucide-react'

export default function OrgChartSeeder({ orgId }: { orgId: string }) {
  const router   = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function seed() {
    setLoading(true)
    setError('')
    try {
      // 1 — Niveau 1
      const l1 = ANEAQ_POSITIONS.filter(p => p.level === 1)
      const { data: inserted1, error: e1 } = await supabase
        .from('org_positions')
        .insert(l1.map(p => ({ organization_id: orgId, title: p.title, level: p.level, order_index: p.order_index })))
        .select('id, order_index')
      if (e1) throw new Error(e1.message)

      // map key → id pour niveau 1
      const idByKey: Record<string, string> = {}
      l1.forEach((p, i) => { idByKey[p.key] = inserted1![i].id })

      // 2 — Niveau 2
      const l2 = ANEAQ_POSITIONS.filter(p => p.level === 2)
      const { data: inserted2, error: e2 } = await supabase
        .from('org_positions')
        .insert(l2.map(p => ({
          organization_id: orgId,
          title:       p.title,
          level:       p.level,
          order_index: p.order_index,
          parent_id:   p.parent_key ? idByKey[p.parent_key] : null,
        })))
        .select('id, order_index')
      if (e2) throw new Error(e2.message)

      l2.forEach((p, i) => { idByKey[p.key] = inserted2![i].id })

      // 3 — Niveau 3
      const l3 = ANEAQ_POSITIONS.filter(p => p.level === 3)
      const { error: e3 } = await supabase
        .from('org_positions')
        .insert(l3.map(p => ({
          organization_id: orgId,
          title:       p.title,
          level:       p.level,
          order_index: p.order_index,
          parent_id:   p.parent_key ? idByKey[p.parent_key] : null,
        })))
      if (e3) throw new Error(e3.message)

      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="text-center">
      <button
        onClick={seed}
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B3A6B] text-white
                   rounded-xl text-sm font-medium hover:bg-[#2E5BA8] transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : '🏛️'}
        {loading ? 'Initialisation...' : 'Initialiser avec le modèle ANEAQ'}
      </button>
      {error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
      )}
    </div>
  )
}
