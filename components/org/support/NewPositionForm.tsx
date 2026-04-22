'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Position = { id: string; title: string; level: number }

export default function NewPositionForm({
  orgId,
  defaultLevel,
  existingPositions,
}: {
  orgId: string
  defaultLevel: number
  existingPositions: Position[]
}) {
  const router   = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const [form, setForm] = useState({
    title:       '',
    level:       String(defaultLevel),
    parent_id:   '',
    order_index: '0',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const level = parseInt(form.level)
  const parentCandidates = existingPositions.filter(p => p.level === level - 1)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Le titre est obligatoire.'); return }
    setLoading(true)
    setError('')

    const { error: err } = await supabase
      .from('org_positions')
      .insert({
        organization_id: orgId,
        title:       form.title.trim(),
        level:       level,
        parent_id:   form.parent_id || null,
        order_index: parseInt(form.order_index) || 0,
      })

    if (err) { setError(err.message); setLoading(false); return }
    router.push(`/org/${orgId}/support/rh`)
    router.refresh()
  }

  const inputCls = `w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`
  const labelCls = `block text-sm font-medium text-slate-700 mb-1`

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-2 gap-4">

          <div className="col-span-2">
            <label className={labelCls}>Intitulé du poste <span className="text-red-500">*</span></label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="Ex: Responsable des Relations Internationales"
              className={inputCls} required />
          </div>

          <div>
            <label className={labelCls}>Niveau hiérarchique</label>
            <select value={form.level} onChange={e => set('level', e.target.value)} className={inputCls}>
              <option value="1">Niveau 1 — Direction</option>
              <option value="2">Niveau 2 — Responsables</option>
              <option value="3">Niveau 3 — Chargés & Agents</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Ordre d'affichage</label>
            <input type="number" value={form.order_index} onChange={e => set('order_index', e.target.value)}
              min="0" className={inputCls} />
          </div>

          {level > 1 && (
            <div className="col-span-2">
              <label className={labelCls}>Rattaché à (poste N{level - 1})</label>
              <select value={form.parent_id} onChange={e => set('parent_id', e.target.value)} className={inputCls}>
                <option value="">— Aucun rattachement —</option>
                {parentCandidates.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-[#1B3A6B] text-white rounded-lg text-sm font-medium
                     hover:bg-[#2E5BA8] transition-colors disabled:opacity-50">
          {loading ? 'Enregistrement...' : 'Créer le poste'}
        </button>
        <a href={`/org/${orgId}/support/rh`}
          className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
          Annuler
        </a>
      </div>
    </form>
  )
}
