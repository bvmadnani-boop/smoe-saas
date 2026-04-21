'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Student = { id: string; full_name: string }
type Teacher = { id: string; full_name: string }

export default function NewPfeForm({
  orgId, students, teachers,
}: {
  orgId: string
  students: Student[]
  teachers: Teacher[]
}) {
  const router   = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [form,    setForm]    = useState({
    student_id:           '',
    title:                '',
    host_company:         '',
    supervisor_internal:  '',
    supervisor_external:  '',
    start_date:           '',
    end_date:             '',
    defense_date:         '',
    defense_location:     '',
    jury_president:       '',
    status:               'pending',
  })

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.student_id) { setError('L\'étudiant est obligatoire.'); return }
    if (!form.title.trim()) { setError('Le titre est obligatoire.'); return }

    setLoading(true); setError('')

    const { error: err } = await supabase.from('pfe_projects').insert({
      organization_id:      orgId,
      student_id:           form.student_id,
      title:                form.title.trim(),
      host_company:         form.host_company.trim() || null,
      supervisor_internal:  form.supervisor_internal || null,
      supervisor_external:  form.supervisor_external.trim() || null,
      start_date:           form.start_date || null,
      end_date:             form.end_date || null,
      defense_date:         form.defense_date || null,
      defense_location:     form.defense_location.trim() || null,
      jury_president:       form.jury_president.trim() || null,
      status:               form.status,
    })

    if (err) { setError(err.message); setLoading(false); return }
    router.push(`/org/${orgId}/diplomation/pfe`)
    router.refresh()
  }

  const inputCls = `w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`
  const labelCls = `block text-sm font-medium text-slate-700 mb-1`

  const STATUS_OPTIONS = [
    { value: 'pending',     label: 'En attente' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'submitted',   label: 'Soumis' },
    { value: 'defended',    label: 'Soutenu' },
    { value: 'validated',   label: 'Validé' },
    { value: 'rejected',    label: 'Rejeté' },
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

      {/* Titre */}
      <div>
        <label className={labelCls}>Titre du projet <span className="text-red-500">*</span></label>
        <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
          placeholder="Ex: Développement d'une application de gestion..." className={inputCls} required />
      </div>

      {/* Entreprise d'accueil */}
      <div>
        <label className={labelCls}>Entreprise d'accueil</label>
        <input type="text" value={form.host_company} onChange={e => set('host_company', e.target.value)}
          placeholder="Ex: OCP Group, Marrakech" className={inputCls} />
      </div>

      {/* Encadrants */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Encadrant interne</label>
          <select value={form.supervisor_internal} onChange={e => set('supervisor_internal', e.target.value)}
            className={inputCls}>
            <option value="">— Sélectionner —</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{t.full_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Encadrant externe</label>
          <input type="text" value={form.supervisor_external}
            onChange={e => set('supervisor_external', e.target.value)}
            placeholder="Nom du superviseur en entreprise" className={inputCls} />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Date de début</label>
          <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)}
            className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Date de fin</label>
          <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)}
            className={inputCls} />
        </div>
      </div>

      {/* Soutenance */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Date de soutenance</label>
          <input type="date" value={form.defense_date} onChange={e => set('defense_date', e.target.value)}
            className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Lieu de soutenance</label>
          <input type="text" value={form.defense_location}
            onChange={e => set('defense_location', e.target.value)}
            placeholder="Ex: Salle des actes, Campus SUP2I" className={inputCls} />
        </div>
      </div>

      {/* Président du jury */}
      <div>
        <label className={labelCls}>Président du jury</label>
        <input type="text" value={form.jury_president}
          onChange={e => set('jury_president', e.target.value)}
          placeholder="Nom et titre du président du jury" className={inputCls} />
      </div>

      {/* Statut */}
      <div>
        <label className={labelCls}>Statut</label>
        <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}>
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-[#1B3A6B] text-white rounded-lg text-sm font-medium
                     hover:bg-[#2E5BA8] transition-colors disabled:opacity-50">
          {loading ? 'Enregistrement...' : 'Créer le projet PFE'}
        </button>
        <a href={`/org/${orgId}/diplomation/pfe`}
          className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
          Annuler
        </a>
      </div>
    </form>
  )
}
