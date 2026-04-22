'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewEquipmentForm({ orgId }: { orgId: string }) {
  const router   = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const [form, setForm] = useState({
    name:             '',
    category:         'informatique',
    serial_number:    '',
    location:         '',
    status:           'operationnel',
    purchase_date:    '',
    last_maintenance: '',
    next_maintenance: '',
    notes:            '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name) { setError("Le nom de l'équipement est obligatoire."); return }
    setLoading(true)
    setError('')

    const { error: err } = await supabase
      .from('support_equipments')
      .insert({
        organization_id:  orgId,
        name:             form.name.trim(),
        category:         form.category,
        serial_number:    form.serial_number.trim()    || null,
        location:         form.location.trim()         || null,
        status:           form.status,
        purchase_date:    form.purchase_date           || null,
        last_maintenance: form.last_maintenance        || null,
        next_maintenance: form.next_maintenance        || null,
        notes:            form.notes.trim()            || null,
      })

    if (err) { setError(err.message); setLoading(false); return }
    router.push(`/org/${orgId}/support/infrastructure`)
    router.refresh()
  }

  const inputCls = `w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`
  const labelCls = `block text-sm font-medium text-slate-700 mb-1`

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Identification</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelCls}>Désignation <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="Ex: Vidéoprojecteur salle 3" className={inputCls} required />
          </div>
          <div>
            <label className={labelCls}>Catégorie</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className={inputCls}>
              <option value="informatique">💻 Informatique</option>
              <option value="audiovisuel">📽️ Audiovisuel</option>
              <option value="mobilier">🪑 Mobilier</option>
              <option value="vehicule">🚗 Véhicule</option>
              <option value="infrastructure">🏛️ Infrastructure</option>
              <option value="autre">📦 Autre</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Numéro de série</label>
            <input type="text" value={form.serial_number} onChange={e => set('serial_number', e.target.value)}
              placeholder="Ex: SN-2024-001" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Emplacement</label>
            <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
              placeholder="Ex: Salle 3 / Secrétariat" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Statut</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}>
              <option value="operationnel">Opérationnel</option>
              <option value="maintenance">En maintenance</option>
              <option value="hors_service">Hors service</option>
              <option value="reserve">En réserve</option>
            </select>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Maintenance</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Date d'achat</label>
            <input type="date" value={form.purchase_date} onChange={e => set('purchase_date', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Dernière maintenance</label>
            <input type="date" value={form.last_maintenance} onChange={e => set('last_maintenance', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Prochaine maintenance</label>
            <input type="date" value={form.next_maintenance} onChange={e => set('next_maintenance', e.target.value)} className={inputCls} />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Notes</h2>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
          placeholder="Fournisseur, garantie, remarques techniques..."
          rows={3} className={`${inputCls} resize-none`} />
      </section>

      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-[#1B3A6B] text-white rounded-lg text-sm font-medium
                     hover:bg-[#2E5BA8] transition-colors disabled:opacity-50">
          {loading ? 'Enregistrement...' : "Ajouter l'équipement"}
        </button>
        <a href={`/org/${orgId}/support/infrastructure`}
          className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
          Annuler
        </a>
      </div>
    </form>
  )
}
