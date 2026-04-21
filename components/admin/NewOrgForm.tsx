'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewOrgForm() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const [form, setForm] = useState({
    name:        '',
    code:        '',
    city:        '',
    region:      '',
    country:     'Maroc',
    phone:       '',
    email:       '',
    address:     '',
    is_active:   true,
  })

  function set(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Le nom est obligatoire.'); return }

    setLoading(true)
    setError('')

    const { error: err } = await supabase
      .from('organizations')
      .insert({
        name:       form.name.trim(),
        code:       form.code.trim().toUpperCase() || null,
        city:       form.city.trim()    || null,
        region:     form.region.trim()  || null,
        country:    form.country.trim() || 'Maroc',
        phone:      form.phone.trim()   || null,
        email:      form.email.trim()   || null,
        address:    form.address.trim() || null,
        is_active:  form.is_active,
      })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    router.push('/admin/organisations')
    router.refresh()
  }

  const inputClass = `w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`

  const labelClass = `block text-sm font-medium text-slate-700 mb-1`

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">

      {/* Nom + Code */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>
            Nom de l'organisation <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Ex: SUP2I Marrakech"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Code territoire</label>
          <input
            type="text"
            value={form.code}
            onChange={e => set('code', e.target.value.toUpperCase())}
            placeholder="Ex: MKC"
            maxLength={10}
            className={inputClass}
          />
        </div>
      </div>

      {/* Ville + Région */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Ville</label>
          <input
            type="text"
            value={form.city}
            onChange={e => set('city', e.target.value)}
            placeholder="Ex: Marrakech"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Région</label>
          <input
            type="text"
            value={form.region}
            onChange={e => set('region', e.target.value)}
            placeholder="Ex: Marrakech-Safi"
            className={inputClass}
          />
        </div>
      </div>

      {/* Pays */}
      <div>
        <label className={labelClass}>Pays</label>
        <input
          type="text"
          value={form.country}
          onChange={e => set('country', e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Email + Téléphone */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="contact@sup2i-mkech.ma"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Téléphone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            placeholder="+212 6XX XXX XXX"
            className={inputClass}
          />
        </div>
      </div>

      {/* Adresse */}
      <div>
        <label className={labelClass}>Adresse</label>
        <textarea
          value={form.address}
          onChange={e => set('address', e.target.value)}
          placeholder="Adresse complète..."
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Statut */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => set('is_active', !form.is_active)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            form.is_active ? 'bg-[#1B3A6B]' : 'bg-slate-300'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              form.is_active ? 'translate-x-4' : 'translate-x-1'
            }`}
          />
        </button>
        <label className="text-sm text-slate-700">
          Organisation active
        </label>
      </div>

      {/* Erreur */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-[#1B3A6B] text-white rounded-lg text-sm font-medium
                     hover:bg-[#2E5BA8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Création...' : 'Créer l\'organisation'}
        </button>
        <a
          href="/admin/organisations"
          className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium
                     hover:bg-slate-200 transition-colors"
        >
          Annuler
        </a>
      </div>

    </form>
  )
}
