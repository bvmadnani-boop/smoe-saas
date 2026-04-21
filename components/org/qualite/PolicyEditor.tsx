'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { POLICY_TEMPLATES, POLICY_STATUS_META } from '@/lib/policy-templates'
import { FileText, Check, Archive, Printer } from 'lucide-react'

type Mode = 'new' | 'edit'
type Status = 'draft' | 'active' | 'archived'

export default function PolicyEditor({
  orgId,
  mode,
  policy,
}: {
  orgId: string
  mode: Mode
  policy?: {
    id: string
    title: string
    content: string
    template_used: string | null
    version: number
    status: Status
    approver_name: string | null
    approved_at: string | null
    review_date: string | null
  }
}) {
  const router   = useRouter()
  const supabase = createClient()

  const [selectedTemplate, setSelectedTemplate] = useState(policy?.template_used ?? '')
  const [title,    setTitle]    = useState(policy?.title   ?? '')
  const [content,  setContent]  = useState(policy?.content ?? '')
  const [approverName, setApprovedBy] = useState(policy?.approver_name ?? '')
  const [reviewDate, setReviewDate] = useState(policy?.review_date ?? '')
  const [status,   setStatus]   = useState<Status>(policy?.status ?? 'draft')
  const [loading,  setLoading]  = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState('')

  function applyTemplate(key: string) {
    const tpl = POLICY_TEMPLATES.find(t => t.key === key)
    if (!tpl) return
    setSelectedTemplate(key)
    if (!title || title === policy?.title) setTitle(tpl.title)
    setContent(tpl.content)
  }

  async function save(newStatus?: Status) {
    if (!title.trim()) { setError('Le titre est obligatoire.'); return }
    if (!content.trim()) { setError('Le contenu est obligatoire.'); return }

    setLoading(true); setError(''); setSaved(false)
    const finalStatus = newStatus ?? status

    if (mode === 'new') {
      const { data, error: err } = await supabase.from('quality_policies').insert({
        organization_id: orgId,
        title:           title.trim(),
        content:         content.trim(),
        template_used:   selectedTemplate || null,
        version:         1,
        status:          finalStatus,
        approver_name:   finalStatus === 'active' ? approverName.trim() || null : null,
        approved_at:     finalStatus === 'active' ? new Date().toISOString().slice(0, 10) : null,
        review_date:     reviewDate || null,
      }).select().single()

      if (err) { setError(err.message); setLoading(false); return }
      router.push(`/org/${orgId}/management/politique/${data.id}`)
      router.refresh()
    } else if (policy) {
      // Si on active une politique, archiver l'ancienne active
      if (finalStatus === 'active') {
        await supabase
          .from('quality_policies')
          .update({ status: 'archived' })
          .eq('organization_id', orgId)
          .eq('status', 'active')
          .neq('id', policy.id)
      }

      const { error: err } = await supabase.from('quality_policies').update({
        title:        title.trim(),
        content:      content.trim(),
        template_used: selectedTemplate || null,
        version:      policy.version + 1,
        status:       finalStatus,
        approver_name: finalStatus === 'active' ? approverName.trim() || null : null,
        approved_at:  finalStatus === 'active' ? new Date().toISOString().slice(0, 10) : null,
        review_date:  reviewDate || null,
      }).eq('id', policy.id)

      if (err) { setError(err.message); setLoading(false); return }
      setSaved(true)
      setStatus(finalStatus)
      setLoading(false)
      router.refresh()
      setTimeout(() => setSaved(false), 2500)
    }
  }

  const inputCls = `w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`

  return (
    <div className="space-y-5">

      {/* Sélecteur de template */}
      {(mode === 'new' || !policy?.content) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-amber-800 mb-3">
            Choisir un modèle de politique qualité
            <span className="ml-2 text-xs font-normal text-amber-600">→ le texte se pré-remplit automatiquement</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            {POLICY_TEMPLATES.map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => applyTemplate(t.key)}
                className={`text-left px-4 py-3 rounded-xl border transition-all ${
                  selectedTemplate === t.key
                    ? 'bg-[#1B3A6B] border-[#1B3A6B] text-white shadow-md scale-[1.01]'
                    : 'bg-white border-slate-200 hover:border-[#1B3A6B] hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{t.icon}</span>
                  <span className={`text-sm font-semibold ${selectedTemplate === t.key ? 'text-white' : 'text-slate-800'}`}>
                    {t.label}
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${selectedTemplate === t.key ? 'text-blue-200' : 'text-slate-500'}`}>
                  {t.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Titre */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="font-semibold text-slate-800 text-sm">Politique qualité</h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Titre <span className="text-red-500">*</span>
          </label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Ex: Politique Qualité — SUP2I Marrakech" className={inputCls} />
        </div>

        {/* Contenu texte */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-slate-700">
              Contenu <span className="text-red-500">*</span>
            </label>
            {mode === 'edit' && policy && (
              <button
                onClick={() => {
                  const key = policy.template_used ?? 'standard_sup2i'
                  applyTemplate(key)
                }}
                className="text-xs text-amber-600 hover:underline"
              >
                Recharger depuis modèle
              </button>
            )}
          </div>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={22}
            placeholder="Rédigez votre politique qualité ou sélectionnez un modèle ci-dessus..."
            className={`${inputCls} resize-y font-mono text-xs leading-relaxed`}
          />
          <p className="text-xs text-slate-400 mt-1">
            Remplacez les champs entre crochets [NOM ÉTABLISSEMENT], [DATE], etc. par vos informations réelles.
          </p>
        </div>
      </div>

      {/* Approbation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="font-semibold text-slate-800 text-sm">Approbation & Révision</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Approuvé par</label>
            <input type="text" value={approverName} onChange={e => setApprovedBy(e.target.value)}
              placeholder="Nom et titre du signataire" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date de révision prévue</label>
            <input type="date" value={reviewDate} onChange={e => setReviewDate(e.target.value)}
              className={inputCls} />
          </div>
        </div>

        {mode === 'edit' && policy && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Version actuelle : <strong>v{policy.version}</strong> ·
              Statut : <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${POLICY_STATUS_META[status]?.cls}`}>
                {POLICY_STATUS_META[status]?.label}
              </span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Toute sauvegarde incrémente automatiquement le numéro de version.
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => save('draft')}
          disabled={loading}
          className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium
                     hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <FileText size={15} />
          {loading ? 'Enregistrement...' : 'Enregistrer brouillon'}
        </button>

        <button
          onClick={() => save('active')}
          disabled={loading}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium
                     hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Check size={15} />
          Approuver & Activer
        </button>

        {mode === 'edit' && status === 'active' && (
          <button
            onClick={() => save('archived')}
            disabled={loading}
            className="px-5 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium
                       hover:bg-amber-100 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Archive size={15} />
            Archiver
          </button>
        )}

        {saved && (
          <span className="text-sm text-emerald-600 font-medium">✓ Sauvegardé (v{(policy?.version ?? 0) + 1})</span>
        )}

        <a href={`/org/${orgId}/management/politique`}
          className="ml-auto px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
          Annuler
        </a>
      </div>
    </div>
  )
}
