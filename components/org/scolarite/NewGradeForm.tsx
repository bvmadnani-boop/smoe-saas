'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Student = { id: string; full_name: string; student_code: string | null }
type Course  = { id: string; name: string; code: string | null }

export default function NewGradeForm({
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
    student_id:  '',
    course_id:   '',
    exam_type:   'controle',
    grade:       '',
    coefficient: '1',
    graded_at:   new Date().toISOString().split('T')[0],
    notes:       '',
  })

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.student_id || !form.course_id || !form.grade) {
      setError('Étudiant, cours et note sont obligatoires.')
      return
    }
    const gradeNum = parseFloat(form.grade)
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 20) {
      setError('La note doit être entre 0 et 20.')
      return
    }

    setLoading(true); setError('')

    const { error: err } = await supabase.from('grades').insert({
      organization_id: orgId,
      student_id:      form.student_id,
      course_id:       form.course_id,
      exam_type:       form.exam_type,
      grade:           gradeNum,
      coefficient:     parseFloat(form.coefficient) || 1,
      graded_at:       form.graded_at || null,
      notes:           form.notes.trim() || null,
    })

    if (err) { setError(err.message); setLoading(false); return }
    router.push(`/org/${orgId}/scolarite/notes`)
    router.refresh()
  }

  const inputCls = `w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`
  const labelCls = `block text-sm font-medium text-slate-700 mb-1`

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
        {students.length === 0 && (
          <p className="text-xs text-amber-600 mt-1">Aucun étudiant actif. Passez un étudiant au statut "actif" d'abord.</p>
        )}
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
        {courses.length === 0 && (
          <p className="text-xs text-amber-600 mt-1">
            Aucun cours créé. <a href={`/org/${orgId}/scolarite/cours/new`} className="underline">Créer un cours</a> d'abord.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Type d'évaluation <span className="text-red-500">*</span></label>
          <select value={form.exam_type} onChange={e => set('exam_type', e.target.value)} className={inputCls}>
            <option value="controle">Contrôle</option>
            <option value="examen">Examen final</option>
            <option value="rattrapage">Rattrapage</option>
            <option value="tp">Travaux Pratiques</option>
            <option value="projet">Projet</option>
            <option value="oral">Oral</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Date d'évaluation</label>
          <input type="date" value={form.graded_at} onChange={e => set('graded_at', e.target.value)}
            className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Note /20 <span className="text-red-500">*</span></label>
          <input type="number" value={form.grade} onChange={e => set('grade', e.target.value)}
            placeholder="Ex: 14.5" min="0" max="20" step="0.25" className={inputCls} required />
        </div>
        <div>
          <label className={labelCls}>Coefficient</label>
          <input type="number" value={form.coefficient} onChange={e => set('coefficient', e.target.value)}
            placeholder="1" min="0.5" max="10" step="0.5" className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Remarques</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
          placeholder="Observations sur l'évaluation..."
          rows={2} className={`${inputCls} resize-none`} />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-[#1B3A6B] text-white rounded-lg text-sm font-medium
                     hover:bg-[#2E5BA8] transition-colors disabled:opacity-50">
          {loading ? 'Enregistrement...' : 'Enregistrer la note'}
        </button>
        <a href={`/org/${orgId}/scolarite/notes`}
          className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
          Annuler
        </a>
      </div>
    </form>
  )
}
