'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Student = { id: string; full_name: string }
type Filiere = { id: string; name: string; code: string | null }
type Pfe     = { id: string; title: string; student_id: string }

export default function NewDiplomaForm({
  orgId, students, filieres, pfes,
}: {
  orgId: string
  students: Student[]
  filieres: Filiere[]
  pfes: Pfe[]
}) {
  const router   = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [form,    setForm]    = useState({
    student_id:     '',
    filiere_id:     '',
    pfe_id:         '',
    diploma_type:   'Licence Professionnelle',
    diploma_number: '',
    issue_date:     '',
    status:         'pending',
  })

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  // Filtrer les PFE validés par étudiant sélectionné
  const availablePfes = form.student_id
    ? pfes.filter(p => p.student_id === form.student_id)
    : pfes

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.student_id) { setError('L\'étudiant est obligatoire.'); return }
    if (!form.filiere_id) { setError('La filière est obligatoire.'); return }

    setLoading(true); setError('')

    const { error: err } = await supabase.from('diplomas').insert({
      organization_id: orgId,
      student_id:      form.student_id,
      filiere_id:      form.filiere_id,
      pfe_id:          form.pfe_id || null,
      diploma_type:    form.diploma_type.trim() || null,
      diploma_number:  form.diploma_number.trim() || null,
      issue_date:      form.issue_date || null,
      status:          form.status,
      sup2i_approved:  false,
    })

    if (err) { setError(err.message); setLoading(false); return }
    router.push(`/org/${orgId}/diplomation/diplomes`)
    router.refresh()
  }

  const inputCls = `w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`
  const labelCls = `block text-sm font-medium text-slate-700 mb-1`

  const DIPLOMA_TYPES = [
    'Licence Professionnelle',
    'Master Spécialisé',
    'Master',
    'BTS',
    'DUT',
    'Diplôme d\'Ingénieur',
    'Autre',
  ]

  const STATUS_OPTIONS = [
    { value: 'pending',        label: 'En attente' },
    { value: 'sup2i_approved', label: 'Approuvé SUP2I' },
    { value: 'issued',         label: 'Émis' },
    { value: 'delivered',      label: 'Remis' },
  ]

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">

      {/* Étudiant */}
      <div>
        <label className={labelCls}>Étudiant <span className="text-red-500">*</span></label>
        <select value={form.student_id} onChange={e => set('student_id', e.target.value)}
          className={inputCls} required>
          <option value="">— Sélectionner un étudiant —</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.full_name}</option>
          ))}
        </select>
      </div>

      {/* Filière */}
      <div>
        <label className={labelCls}>Filière <span className="text-red-500">*</span></label>
        <select value={form.filiere_id} onChange={e => set('filiere_id', e.target.value)}
          className={inputCls} required>
          <option value="">— Sélectionner une filière —</option>
          {filieres.map(f => (
            <option key={f.id} value={f.id}>
              {f.name}{f.code ? ` (${f.code})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Projet PFE associé */}
      <div>
        <label className={labelCls}>Projet PFE associé <span className="text-slate-400 font-normal">(optionnel)</span></label>
        <select value={form.pfe_id} onChange={e => set('pfe_id', e.target.value)} className={inputCls}>
          <option value="">— Aucun PFE associé —</option>
          {availablePfes.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      {/* Type de diplôme */}
      <div>
        <label className={labelCls}>Type de diplôme</label>
        <select value={form.diploma_type} onChange={e => set('diploma_type', e.target.value)} className={inputCls}>
          {DIPLOMA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Numéro + Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Numéro de diplôme</label>
          <input type="text" value={form.diploma_number}
            onChange={e => set('diploma_number', e.target.value)}
            placeholder="Ex: DIP-2025-0042" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Date d'émission</label>
          <input type="date" value={form.issue_date}
            onChange={e => set('issue_date', e.target.value)}
            className={inputCls} />
        </div>
      </div>

      {/* Statut initial */}
      <div>
        <label className={labelCls}>Statut initial</label>
        <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}>
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Note workflow */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700">
        <strong>Workflow SUP2I :</strong> Après création, le diplôme doit être soumis à SUP2I pour approbation
        avant d'être émis et remis à l'étudiant.
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-[#1B3A6B] text-white rounded-lg text-sm font-medium
                     hover:bg-[#2E5BA8] transition-colors disabled:opacity-50">
          {loading ? 'Enregistrement...' : 'Créer le diplôme'}
        </button>
        <a href={`/org/${orgId}/diplomation/diplomes`}
          className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
          Annuler
        </a>
      </div>
    </form>
  )
}
