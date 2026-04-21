'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Filiere = { id: string; name: string }

export default function NewCourseForm({ orgId, filieres }: { orgId: string; filieres: Filiere[] }) {
  const router   = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [form,    setForm]    = useState({
    name:        '',
    code:        '',
    filiere_id:  '',
    semester:    '1',
    level:       '',
    credits:     '',
    hours_total: '',
  })

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name) { setError('Nom du cours obligatoire.'); return }
    setLoading(true); setError('')

    const { error: err } = await supabase.from('courses').insert({
      organization_id: orgId,
      name:            form.name.trim(),
      code:            form.code.trim().toUpperCase() || null,
      filiere_id:      form.filiere_id || null,
      semester:        form.semester ? parseInt(form.semester) : null,
      level:           form.level || null,
      credits:         form.credits ? parseInt(form.credits) : null,
      hours_total:     form.hours_total ? parseInt(form.hours_total) : null,
    })

    if (err) { setError(err.message); setLoading(false); return }
    router.push(`/org/${orgId}/scolarite/cours`)
    router.refresh()
  }

  const inputCls = `w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`
  const labelCls = `block text-sm font-medium text-slate-700 mb-1`

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className={labelCls}>Intitulé du cours <span className="text-red-500">*</span></label>
          <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="Ex: Algorithmique et Programmation" className={inputCls} required />
        </div>
        <div>
          <label className={labelCls}>Code</label>
          <input type="text" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())}
            placeholder="Ex: ALG101" className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Filière</label>
        <select value={form.filiere_id} onChange={e => set('filiere_id', e.target.value)} className={inputCls}>
          <option value="">— Sélectionner une filière —</option>
          {filieres.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Semestre</label>
          <select value={form.semester} onChange={e => set('semester', e.target.value)} className={inputCls}>
            {[1,2,3,4,5,6].map(s => <option key={s} value={s}>Semestre {s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Crédits</label>
          <input type="number" value={form.credits} onChange={e => set('credits', e.target.value)}
            placeholder="Ex: 3" min="1" max="10" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Volume horaire</label>
          <input type="number" value={form.hours_total} onChange={e => set('hours_total', e.target.value)}
            placeholder="Ex: 30" min="1" className={inputCls} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-[#1B3A6B] text-white rounded-lg text-sm font-medium
                     hover:bg-[#2E5BA8] transition-colors disabled:opacity-50">
          {loading ? 'Enregistrement...' : 'Créer le cours'}
        </button>
        <a href={`/org/${orgId}/scolarite/cours`}
          className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
          Annuler
        </a>
      </div>
    </form>
  )
}
