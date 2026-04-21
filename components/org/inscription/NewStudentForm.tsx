'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Filiere = { id: string; name: string; code: string | null }

export default function NewStudentForm({
  orgId,
  filieres,
}: {
  orgId: string
  filieres: Filiere[]
}) {
  const router   = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const [form, setForm] = useState({
    first_name:    '',
    last_name:     '',
    email:         '',
    phone:         '',
    date_of_birth: '',
    nationality:   'Marocaine',
    cin:           '',
    address:       '',
    filiere_id:    '',
    academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    status:        'inscrit',
    notes:         '',
    gender:        '',
    bac_year:      '',
    bac_mention:   '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.first_name || !form.last_name) {
      setError('Prénom et nom sont obligatoires.')
      return
    }

    setLoading(true)
    setError('')

    const { data, error: err } = await supabase
      .from('students')
      .insert({
        organization_id: orgId,
        full_name:       `${form.first_name.trim()} ${form.last_name.trim()}`,
        email:           form.email.trim()       || null,
        phone:           form.phone.trim()       || null,
        date_of_birth:   form.date_of_birth      || null,
        nationality:     form.nationality        || null,
        cin:             form.cin.trim()         || null,
        address:         form.address.trim()     || null,
        filiere_id:      form.filiere_id         || null,
        academic_year:   form.academic_year      || null,
        status:          form.status,
        notes:           form.notes.trim()       || null,
        gender:          form.gender             || null,
        bac_year:        form.bac_year ? parseInt(form.bac_year) : null,
        bac_mention:     form.bac_mention        || null,
      })
      .select('id')
      .single()

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    router.push(`/org/${orgId}/inscription/${data.id}`)
    router.refresh()
  }

  const inputCls = `w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`
  const labelCls = `block text-sm font-medium text-slate-700 mb-1`

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Identité */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Identité</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Prénom <span className="text-red-500">*</span></label>
            <input type="text" value={form.first_name} onChange={e => set('first_name', e.target.value)}
              placeholder="Prénom" className={inputCls} required />
          </div>
          <div>
            <label className={labelCls}>Nom <span className="text-red-500">*</span></label>
            <input type="text" value={form.last_name} onChange={e => set('last_name', e.target.value)}
              placeholder="Nom de famille" className={inputCls} required />
          </div>
          <div>
            <label className={labelCls}>Genre</label>
            <select value={form.gender} onChange={e => set('gender', e.target.value)} className={inputCls}>
              <option value="">— Sélectionner —</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Date de naissance</label>
            <input type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)}
              className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Nationalité</label>
            <input type="text" value={form.nationality} onChange={e => set('nationality', e.target.value)}
              className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>CIN / Passeport</label>
            <input type="text" value={form.cin} onChange={e => set('cin', e.target.value)}
              placeholder="Ex: AB123456" className={inputCls} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Adresse</label>
            <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
              placeholder="Adresse complète" className={inputCls} />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Contact</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="etudiant@example.com" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Téléphone</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder="+212 6XX XXX XXX" className={inputCls} />
          </div>
        </div>
      </section>

      {/* Parcours scolaire */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Parcours scolaire</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Année du BAC</label>
            <input type="number" value={form.bac_year} onChange={e => set('bac_year', e.target.value)}
              placeholder="Ex: 2024" min="2000" max="2030" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Mention BAC</label>
            <select value={form.bac_mention} onChange={e => set('bac_mention', e.target.value)} className={inputCls}>
              <option value="">— Sélectionner —</option>
              <option value="passable">Passable</option>
              <option value="assez_bien">Assez Bien</option>
              <option value="bien">Bien</option>
              <option value="tres_bien">Très Bien</option>
            </select>
          </div>
        </div>
      </section>

      {/* Inscription académique */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Inscription académique</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Filière</label>
            <select value={form.filiere_id} onChange={e => set('filiere_id', e.target.value)} className={inputCls}>
              <option value="">— Sélectionner une filière —</option>
              {filieres.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name}{f.code ? ` (${f.code})` : ''}
                </option>
              ))}
            </select>
            {filieres.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">Aucune filière. Vous pourrez l'assigner plus tard.</p>
            )}
          </div>
          <div>
            <label className={labelCls}>Année académique</label>
            <input type="text" value={form.academic_year} onChange={e => set('academic_year', e.target.value)}
              placeholder="Ex: 2025-2026" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Statut initial</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}>
              <option value="inscrit">Inscrit</option>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Notes internes</h2>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
          placeholder="Observations, remarques sur le dossier..."
          rows={3} className={`${inputCls} resize-none`} />
      </section>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-[#1B3A6B] text-white rounded-lg text-sm font-medium
                     hover:bg-[#2E5BA8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Enregistrement...' : "Inscrire l'étudiant"}
        </button>
        <a href={`/org/${orgId}/inscription`}
          className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
          Annuler
        </a>
      </div>

    </form>
  )
}
