'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Course  = { id: string; name: string; code: string | null }
type Teacher = { id: string; full_name: string }

export default function NewScheduleForm({
  orgId, courses, teachers,
}: {
  orgId: string
  courses: Course[]
  teachers: Teacher[]
}) {
  const router   = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [form,    setForm]    = useState({
    course_id:   '',
    teacher_id:  '',
    day_of_week: 'lun',
    start_time:  '08:00',
    end_time:    '10:00',
    room:        '',
    type:        'CM',
  })

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.course_id) { setError('Le cours est obligatoire.'); return }
    if (form.start_time >= form.end_time) { setError('L\'heure de fin doit être après l\'heure de début.'); return }

    setLoading(true); setError('')

    const { error: err } = await supabase.from('schedules').insert({
      organization_id: orgId,
      course_id:       form.course_id,
      teacher_id:      form.teacher_id || null,
      day_of_week:     form.day_of_week,
      start_time:      form.start_time,
      end_time:        form.end_time,
      room:            form.room.trim() || null,
      type:            form.type,
    })

    if (err) { setError(err.message); setLoading(false); return }
    router.push(`/org/${orgId}/scolarite/emploi-du-temps`)
    router.refresh()
  }

  const inputCls = `w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`
  const labelCls = `block text-sm font-medium text-slate-700 mb-1`

  const TYPE_OPTIONS = [
    { value: 'CM',    label: 'Cours Magistral', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'TD',    label: 'TD',              color: 'bg-violet-50 text-violet-700 border-violet-200' },
    { value: 'TP',    label: 'TP',              color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { value: 'DS',    label: 'Devoir/Examen',   color: 'bg-red-50 text-red-700 border-red-200' },
    { value: 'Autre', label: 'Autre',           color: 'bg-amber-50 text-amber-700 border-amber-200' },
  ]

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">

      {/* Type de séance */}
      <div>
        <label className={labelCls}>Type de séance</label>
        <div className="flex gap-2 flex-wrap">
          {TYPE_OPTIONS.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => set('type', t.value)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                form.type === t.value
                  ? t.color + ' shadow-sm scale-[1.03]'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cours */}
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

      {/* Enseignant */}
      <div>
        <label className={labelCls}>Enseignant</label>
        <select value={form.teacher_id} onChange={e => set('teacher_id', e.target.value)} className={inputCls}>
          <option value="">— Sélectionner un enseignant —</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
        </select>
      </div>

      {/* Jour + Salle */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Jour</label>
          <select value={form.day_of_week} onChange={e => set('day_of_week', e.target.value)} className={inputCls}>
            <option value="lun">Lundi</option>
            <option value="mar">Mardi</option>
            <option value="mer">Mercredi</option>
            <option value="jeu">Jeudi</option>
            <option value="ven">Vendredi</option>
            <option value="sam">Samedi</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Salle</label>
          <input type="text" value={form.room} onChange={e => set('room', e.target.value)}
            placeholder="Ex: Salle A1, Labo 2..." className={inputCls} />
        </div>
      </div>

      {/* Horaires */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Heure de début</label>
          <input type="time" value={form.start_time} onChange={e => set('start_time', e.target.value)}
            className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Heure de fin</label>
          <input type="time" value={form.end_time} onChange={e => set('end_time', e.target.value)}
            className={inputCls} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-[#1B3A6B] text-white rounded-lg text-sm font-medium
                     hover:bg-[#2E5BA8] transition-colors disabled:opacity-50">
          {loading ? 'Enregistrement...' : 'Ajouter la séance'}
        </button>
        <a href={`/org/${orgId}/scolarite/emploi-du-temps`}
          className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
          Annuler
        </a>
      </div>
    </form>
  )
}
