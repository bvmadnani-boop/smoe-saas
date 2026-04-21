'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Student = { id: string; full_name: string; student_code: string | null }
type Course  = { id: string; name: string; code: string | null }

export default function NewAttendanceForm({
  orgId, students, courses,
}: {
  orgId: string
  students: Student[]
  courses: Course[]
}) {
  const router   = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [form,    setForm]    = useState({
    student_id: '',
    course_id:  '',
    date:       new Date().toISOString().split('T')[0],
    status:     'present',
    notes:      '',
  })

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.student_id || !form.course_id) {
      setError('Étudiant et cours sont obligatoires.')
      return
    }
    setLoading(true); setError('')

    const { error: err } = await supabase.from('attendance').insert({
      organization_id: orgId,
      student_id:      form.student_id,
      course_id:       form.course_id,
      date:            form.date,
      status:          form.status,
      notes:           form.notes.trim() || null,
    })

    if (err) { setError(err.message); setLoading(false); return }
    router.push(`/org/${orgId}/scolarite/presences`)
    router.refresh()
  }

  const inputCls = `w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`
  const labelCls = `block text-sm font-medium text-slate-700 mb-1`

  const statuts = [
    { value: 'present',   label: '✅ Présent',  color: 'border-emerald-300 bg-emerald-50 text-emerald-700' },
    { value: 'absent',    label: '❌ Absent',   color: 'border-red-300 bg-red-50 text-red-600' },
    { value: 'retard',    label: '⏰ Retard',   color: 'border-amber-300 bg-amber-50 text-amber-600' },
    { value: 'excused',   label: '📄 Excusé',   color: 'border-blue-300 bg-blue-50 text-blue-600' },
    { value: 'justified', label: '✔ Justifié', color: 'border-violet-300 bg-violet-50 text-violet-600' },
  ]

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">

      <div>
        <label className={labelCls}>Étudiant <span className="text-red-500">*</span></label>
        <select value={form.student_id} onChange={e => set('student_id', e.target.value)}
          className={inputCls} required>
          <option value="">— Sélectionner un étudiant —</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>
              {s.full_name} {s.student_code ? `(${s.student_code})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelCls}>Cours <span className="text-red-500">*</span></label>
        <select value={form.course_id} onChange={e => set('course_id', e.target.value)}
          className={inputCls} required>
          <option value="">— Sélectionner un cours —</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}{c.code ? ` (${c.code})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelCls}>Date</label>
        <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
          className={inputCls} />
      </div>

      {/* Statut — boutons visuels */}
      <div>
        <label className={labelCls}>Statut <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-5 gap-2">
          {statuts.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => set('status', s.value)}
              className={`py-2.5 px-2 rounded-lg border-2 text-xs font-medium text-center transition-all ${
                form.status === s.value
                  ? s.color + ' shadow-sm scale-[1.02]'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls}>Remarque</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
          placeholder="Motif d'absence, observation..."
          rows={2} className={`${inputCls} resize-none`} />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-[#1B3A6B] text-white rounded-lg text-sm font-medium
                     hover:bg-[#2E5BA8] transition-colors disabled:opacity-50">
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        <a href={`/org/${orgId}/scolarite/presences`}
          className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
          Annuler
        </a>
      </div>
    </form>
  )
}
