'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { COMM_CHANNELS } from '@/lib/support-templates'

export default function NewCommunicationForm({ orgId }: { orgId: string }) {
  const router   = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const [form, setForm] = useState({
    subject:            '',
    type:               'interne',
    target:             '',
    channel:            '',
    date_communication: '',
    statut:             'planifie',
    responsible:        '',
    notes:              '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.subject) { setError('Le sujet est obligatoire.'); return }
    setLoading(true)
    setError('')

    const { error: err } = await supabase
      .from('support_communications')
      .insert({
        organization_id:    orgId,
        subject:            form.subject.trim(),
        type:               form.type,
        target:             form.target.trim()             || null,
        channel:            form.channel.trim()            || null,
        date_communication: form.date_communication       || null,
        statut:             form.statut,
        responsible:        form.responsible.trim()       || null,
        notes:              form.notes.trim()              || null,
      })

    if (err) { setError(err.message); setLoading(false); return }
    router.push(`/org/${orgId}/support/communication`)
    router.refresh()
  }

  const inputCls = `w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`
  const labelCls = `block text-sm font-medium text-slate-700 mb-1`

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Communication §7.4</h2>
        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 mb-4">
          Documentez : <strong>Quoi</strong> — <strong>Quand</strong> — <strong>À qui</strong> — <strong>Comment</strong> — <strong>Qui</strong>
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelCls}>Sujet / Objet <span className="text-red-500">*</span></label>
            <input type="text" value={form.subject} onChange={e => set('subject', e.target.value)}
              placeholder="Ex: Diffusion de la politique qualité au personnel" className={inputCls} required />
          </div>
          <div>
            <label className={labelCls}>Type</label>
            <select value={form.type} onChange={e => set('type', e.target.value)} className={inputCls}>
              <option value="interne">Interne</option>
              <option value="externe">Externe</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Destinataire / Cible</label>
            <input type="text" value={form.target} onChange={e => set('target', e.target.value)}
              placeholder="Ex: Tout le personnel / SUP2I" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Canal de communication</label>
            <select value={form.channel} onChange={e => set('channel', e.target.value)} className={inputCls}>
              <option value="">— Sélectionner —</option>
              {COMM_CHANNELS.map(ch => <option key={ch} value={ch}>{ch}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Date prévue / réalisée</label>
            <input type="date" value={form.date_communication} onChange={e => set('date_communication', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Responsable (Qui communique)</label>
            <input type="text" value={form.responsible} onChange={e => set('responsible', e.target.value)}
              placeholder="Ex: Direction / RQ" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Statut</label>
            <select value={form.statut} onChange={e => set('statut', e.target.value)} className={inputCls}>
              <option value="planifie">Planifié</option>
              <option value="envoye">Envoyé</option>
              <option value="recu">Reçu</option>
              <option value="archive">Archivé</option>
            </select>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Notes</h2>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
          placeholder="Contenu du message, documents joints, remarques..."
          rows={3} className={`${inputCls} resize-none`} />
      </section>

      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-[#1B3A6B] text-white rounded-lg text-sm font-medium
                     hover:bg-[#2E5BA8] transition-colors disabled:opacity-50">
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        <a href={`/org/${orgId}/support/communication`}
          className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
          Annuler
        </a>
      </div>
    </form>
  )
}
