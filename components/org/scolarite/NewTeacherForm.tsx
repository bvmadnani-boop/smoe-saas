'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewTeacherForm({ orgId }: { orgId: string }) {
  const router   = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [form,    setForm]    = useState({
    full_name:  '',
    email:      '',
    phone:      '',
    speciality: '',
    diploma:    '',
    status:     'actif',
  })

  function set(k: string, v: string) {
    setForm(p => ({ ...p, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name) { setError('Nom obligatoire.'); return }
    setLoading(true); setError('')

    const { error: err } = await supabase.from('teachers').insert({
      organization_id: orgId,
      full_name:       form.full_name.trim(),
      email:           form.email.trim()      || null,
      phone:           form.phone.trim()      || null,
      speciality:      form.speciality.trim() || null,
      diploma:         form.diploma.trim()    || null,
      status:          form.status,
      sup2i_validated: false,
    })

    if (err) { setError(err.message); setLoading(false); return }
    router.push(`/org/${orgId}/scolarite/enseignants`)
    router.refresh()
  }

  const inputCls = `w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`
  const labelCls = `block text-sm font-medium text-slate-700 mb-1`

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className={labelCls}>Nom complet <span className="text-red-500">*</span></label>
          <input type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)}
            placeholder="Dr. Mohamed Alami" className={inputCls} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="prof@example.ma" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Téléphone</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder="+212 6XX XXX XXX" className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Spécialité</label>
          <input type="text" value={form.speciality} onChange={e => set('speciality', e.target.value)}
            placeholder="Ex: Informatique, Gestion, Marketing..." className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Diplôme</label>
          <input type="text" value={form.diploma} onChange={e => set('diploma', e.target.value)}
            placeholder="Ex: Doctorat en Informatique" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Statut</label>
          <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
            <option value="vacataire">Vacataire</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-[#1B3A6B] text-white rounded-lg text-sm font-medium
                     hover:bg-[#2E5BA8] transition-colors disabled:opacity-50">
          {loading ? 'Enregistrement...' : 'Ajouter l\'enseignant'}
        </button>
        <a href={`/org/${orgId}/scolarite/enseignants`}
          className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
          Annuler
        </a>
      </div>
    </form>
  )
}
