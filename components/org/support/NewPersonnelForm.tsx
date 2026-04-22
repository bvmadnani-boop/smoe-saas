'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PERSONNEL_ROLES } from '@/lib/support-templates'

export default function NewPersonnelForm({ orgId }: { orgId: string }) {
  const router   = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const [form, setForm] = useState({
    full_name:             '',
    role:                  '',
    role_custom:           '',
    contract_type:         'cdi',
    status:                'actif',
    start_date:            '',
    end_date:              '',
    email:                 '',
    phone:                 '',
    sensibilisation_done:  false,
    notes:                 '',
  })

  function set(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const finalRole = form.role === 'Autre' ? form.role_custom : form.role
    if (!form.full_name || !finalRole) {
      setError('Nom et rôle sont obligatoires.')
      return
    }
    setLoading(true)
    setError('')

    const { error: err } = await supabase
      .from('support_personnel')
      .insert({
        organization_id:      orgId,
        full_name:            form.full_name.trim(),
        role:                 finalRole.trim(),
        contract_type:        form.contract_type,
        status:               form.status,
        start_date:           form.start_date   || null,
        end_date:             form.end_date      || null,
        email:                form.email.trim()  || null,
        phone:                form.phone.trim()  || null,
        sensibilisation_done: form.sensibilisation_done,
        notes:                form.notes.trim()  || null,
      })

    if (err) { setError(err.message); setLoading(false); return }
    router.push(`/org/${orgId}/support/rh`)
    router.refresh()
  }

  const inputCls = `w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`
  const labelCls = `block text-sm font-medium text-slate-700 mb-1`

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Identité */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Identité</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelCls}>Nom complet <span className="text-red-500">*</span></label>
            <input type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)}
              placeholder="Prénom Nom" className={inputCls} required />
          </div>
          <div>
            <label className={labelCls}>Rôle / Fonction <span className="text-red-500">*</span></label>
            <select value={form.role} onChange={e => set('role', e.target.value)} className={inputCls}>
              <option value="">— Sélectionner —</option>
              {PERSONNEL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {form.role === 'Autre' && (
            <div>
              <label className={labelCls}>Préciser le rôle</label>
              <input type="text" value={form.role_custom} onChange={e => set('role_custom', e.target.value)}
                placeholder="Ex: Chargé de projets" className={inputCls} />
            </div>
          )}
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="prenom.nom@school.ma" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Téléphone</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder="+212 6XX XXX XXX" className={inputCls} />
          </div>
        </div>
      </section>

      {/* Contrat */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Contrat</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Type de contrat</label>
            <select value={form.contract_type} onChange={e => set('contract_type', e.target.value)} className={inputCls}>
              <option value="cdi">CDI</option>
              <option value="cdd">CDD</option>
              <option value="vacataire">Vacataire</option>
              <option value="stagiaire">Stagiaire</option>
              <option value="benevole">Bénévole</option>
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
          <div>
            <label className={labelCls}>Date de fin (si CDD)</label>
            <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} className={inputCls} />
          </div>
        </div>
      </section>

      {/* ISO §7.3 Sensibilisation */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          §7.3 Sensibilisation ISO 21001
        </h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.sensibilisation_done}
            onChange={e => set('sensibilisation_done', e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-[#1B3A6B] focus:ring-[#1B3A6B]"
          />
          <span className="text-sm text-slate-700">
            Ce membre a été sensibilisé à la politique qualité, aux objectifs et aux exigences ISO 21001
          </span>
        </label>
      </section>

      {/* Notes */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Notes internes</h2>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
          placeholder="Compétences clés, formations suivies, remarques..."
          rows={3} className={`${inputCls} resize-none`} />
      </section>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-[#1B3A6B] text-white rounded-lg text-sm font-medium
                     hover:bg-[#2E5BA8] transition-colors disabled:opacity-50">
          {loading ? 'Enregistrement...' : 'Ajouter le membre'}
        </button>
        <a href={`/org/${orgId}/support/rh`}
          className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
          Annuler
        </a>
      </div>
    </form>
  )
}
