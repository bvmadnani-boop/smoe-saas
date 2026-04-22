'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserCheck, UserX } from 'lucide-react'

type Personnel = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  contract_type: string
  status: string
  start_date: string | null
  end_date: string | null
  teaches_courses: boolean
  sensibilisation_done: boolean
  notes: string | null
}

export default function PersonnelAssigner({
  orgId,
  positionId,
  existingPersonnel,
}: {
  orgId: string
  positionId: string
  existingPersonnel: Personnel | null
}) {
  const router   = useRouter()
  const supabase = createClient()

  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [saved,    setSaved]    = useState(false)
  const [mode,     setMode]     = useState<'view' | 'edit' | 'free'>('view')

  const [form, setForm] = useState({
    full_name:           existingPersonnel?.full_name           ?? '',
    email:               existingPersonnel?.email               ?? '',
    phone:               existingPersonnel?.phone               ?? '',
    contract_type:       existingPersonnel?.contract_type       ?? 'cdi',
    status:              existingPersonnel?.status              ?? 'actif',
    start_date:          existingPersonnel?.start_date          ?? '',
    end_date:            existingPersonnel?.end_date            ?? '',
    teaches_courses:     existingPersonnel?.teaches_courses     ?? false,
    sensibilisation_done:existingPersonnel?.sensibilisation_done?? false,
    notes:               existingPersonnel?.notes               ?? '',
  })

  function set(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name.trim()) { setError('Le nom est obligatoire.'); return }
    setLoading(true)
    setError('')
    setSaved(false)

    const payload = {
      organization_id:      orgId,
      position_id:          positionId,
      full_name:            form.full_name.trim(),
      email:                form.email.trim()  || null,
      phone:                form.phone.trim()  || null,
      contract_type:        form.contract_type,
      status:               form.status,
      start_date:           form.start_date    || null,
      end_date:             form.end_date      || null,
      teaches_courses:      form.teaches_courses,
      sensibilisation_done: form.sensibilisation_done,
      notes:                form.notes.trim()  || null,
      updated_at:           new Date().toISOString(),
    }

    let err
    if (existingPersonnel?.id) {
      const res = await supabase.from('support_personnel').update(payload).eq('id', existingPersonnel.id)
      err = res.error
    } else {
      const res = await supabase.from('support_personnel').insert(payload)
      err = res.error
    }

    if (err) { setError(err.message); setLoading(false); return }
    setSaved(true)
    setLoading(false)
    setMode('view')
    router.refresh()
  }

  async function handleFreePost() {
    if (!existingPersonnel?.id) return
    if (!confirm('Libérer ce poste ? La personne sera conservée sans affectation.')) return
    setLoading(true)
    await supabase.from('support_personnel')
      .update({ position_id: null, updated_at: new Date().toISOString() })
      .eq('id', existingPersonnel.id)
    setLoading(false)
    router.refresh()
  }

  const inputCls = `w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`
  const labelCls = `block text-sm font-medium text-slate-700 mb-1`

  // — Vue titulaire (mode view, existingPersonnel présent) —
  if (existingPersonnel && mode === 'view') {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700">Titulaire actuel</h3>
          <div className="flex gap-2">
            <button onClick={() => setMode('edit')}
              className="text-xs text-[#1B3A6B] hover:underline font-medium">
              Modifier
            </button>
            <button onClick={handleFreePost} disabled={loading}
              className="text-xs text-red-500 hover:underline font-medium">
              Libérer le poste
            </button>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1B3A6B]/10 flex items-center justify-center shrink-0">
              <span className="text-[#1B3A6B] text-sm font-bold">
                {existingPersonnel.full_name?.split(' ').map(n => n[0]).slice(0,2).join('')}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{existingPersonnel.full_name}</p>
              <p className="text-xs text-slate-500">{existingPersonnel.email ?? '—'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: 'Contrat',   value: existingPersonnel.contract_type.toUpperCase() },
              { label: 'Entrée',    value: existingPersonnel.start_date ? new Date(existingPersonnel.start_date).toLocaleDateString('fr-FR') : '—' },
              { label: '§7.3 Sens.',value: existingPersonnel.sensibilisation_done ? '✓ Fait' : '⚠ À faire' },
              { label: 'Enseigne',  value: existingPersonnel.teaches_courses ? '✓ Oui (P4)' : 'Non' },
            ].map(({ label, value }) => (
              <div key={label}>
                <span className="text-slate-400">{label} : </span>
                <span className="text-slate-700 font-medium">{value}</span>
              </div>
            ))}
          </div>
          {existingPersonnel.teaches_courses && (
            <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700">
              ↗ Enseigne aussi — retrouver ses cours dans <strong>P4 Scolarité › Enseignants</strong>
            </div>
          )}
        </div>
        {saved && <p className="mt-2 text-sm text-emerald-600">✓ Enregistré</p>}
      </div>
    )
  }

  // — Poste vacant ou mode édition —
  const isEditing = mode === 'edit'

  return (
    <form onSubmit={handleSave}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">
          {isEditing ? 'Modifier le titulaire' : 'Affecter une personne'}
        </h3>
        {isEditing && (
          <button type="button" onClick={() => setMode('view')}
            className="text-xs text-slate-400 hover:text-slate-600">
            Annuler
          </button>
        )}
      </div>

      {!isEditing && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
          <UserX size={16} className="text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700 font-medium">Poste vacant</p>
        </div>
      )}

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={labelCls}>Nom complet <span className="text-red-500">*</span></label>
            <input type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)}
              placeholder="Prénom Nom" className={inputCls} required />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Téléphone</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
              className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Type de contrat</label>
            <select value={form.contract_type} onChange={e => set('contract_type', e.target.value)} className={inputCls}>
              <option value="cdi">CDI</option>
              <option value="cdd">CDD</option>
              <option value="temps_partiel">Temps partiel</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Statut</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}>
              <option value="actif">Actif</option>
              <option value="essai">Période d&apos;essai</option>
              <option value="conge">En congé</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Date d'entrée</label>
            <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} className={inputCls} />
          </div>
          {form.contract_type === 'cdd' && (
            <div>
              <label className={labelCls}>Date de fin</label>
              <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} className={inputCls} />
            </div>
          )}
        </div>

        <div className="space-y-2 pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={form.sensibilisation_done}
              onChange={e => set('sensibilisation_done', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#1B3A6B]" />
            <span className="text-sm text-slate-700">§7.3 — Sensibilisation ISO 21001 complétée</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={form.teaches_courses}
              onChange={e => set('teaches_courses', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#1B3A6B]" />
            <span className="text-sm text-slate-700">Enseigne aussi des cours (géré dans P4)</span>
          </label>
        </div>

        <div>
          <label className={labelCls}>Notes</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
            rows={2} className={`${inputCls} resize-none`} />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}
      {saved && <p className="mt-3 text-sm text-emerald-600">✓ Enregistré</p>}

      <div className="flex items-center gap-3 mt-4">
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white rounded-lg text-sm font-medium
                     hover:bg-[#2E5BA8] transition-colors disabled:opacity-50">
          <UserCheck size={15} />
          {loading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Affecter'}
        </button>
      </div>
    </form>
  )
}
