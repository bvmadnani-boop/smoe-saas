'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewDocumentForm({ orgId }: { orgId: string }) {
  const router   = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const [form, setForm] = useState({
    reference:     '',
    title:         '',
    document_type: 'procedure',
    version:       '1.0',
    status:        'actif',
    owner:         '',
    review_date:   '',
    description:   '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title) { setError('Le titre est obligatoire.'); return }
    setLoading(true)
    setError('')

    const { error: err } = await supabase
      .from('support_documents')
      .insert({
        organization_id: orgId,
        reference:       form.reference.trim()   || null,
        title:           form.title.trim(),
        document_type:   form.document_type,
        version:         form.version.trim()     || '1.0',
        status:          form.status,
        owner:           form.owner.trim()       || null,
        review_date:     form.review_date        || null,
        description:     form.description.trim() || null,
      })

    if (err) { setError(err.message); setLoading(false); return }
    router.push(`/org/${orgId}/support/documents`)
    router.refresh()
  }

  const inputCls = `w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`
  const labelCls = `block text-sm font-medium text-slate-700 mb-1`

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Identification</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Référence</label>
            <input type="text" value={form.reference} onChange={e => set('reference', e.target.value)}
              placeholder="Ex: PRO-QUA-01" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Type de document</label>
            <select value={form.document_type} onChange={e => set('document_type', e.target.value)} className={inputCls}>
              <option value="procedure">📋 Procédure</option>
              <option value="instruction">📝 Instruction</option>
              <option value="formulaire">📄 Formulaire</option>
              <option value="enregistrement">🗂️ Enregistrement</option>
              <option value="politique">📌 Politique</option>
              <option value="manuel">📚 Manuel</option>
              <option value="plan">🗺️ Plan</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Titre <span className="text-red-500">*</span></label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="Ex: Procédure de gestion des non-conformités" className={inputCls} required />
          </div>
          <div>
            <label className={labelCls}>Version</label>
            <input type="text" value={form.version} onChange={e => set('version', e.target.value)}
              placeholder="1.0" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Statut</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}>
              <option value="actif">Actif</option>
              <option value="en_revision">En révision</option>
              <option value="archive">Archivé</option>
              <option value="obsolete">Obsolète</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Responsable (propriétaire)</label>
            <input type="text" value={form.owner} onChange={e => set('owner', e.target.value)}
              placeholder="Ex: Responsable qualité" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Date de révision prévue</label>
            <input type="date" value={form.review_date} onChange={e => set('review_date', e.target.value)}
              className={inputCls} />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Description</h2>
        <textarea value={form.description} onChange={e => set('description', e.target.value)}
          placeholder="Objet et périmètre du document..."
          rows={3} className={`${inputCls} resize-none`} />
      </section>

      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-[#1B3A6B] text-white rounded-lg text-sm font-medium
                     hover:bg-[#2E5BA8] transition-colors disabled:opacity-50">
          {loading ? 'Enregistrement...' : 'Créer le document'}
        </button>
        <a href={`/org/${orgId}/support/documents`}
          className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
          Annuler
        </a>
      </div>
    </form>
  )
}
