'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, X } from 'lucide-react'

type Fiche = {
  id?: string
  role_description?: string | null
  missions?: string[]
  responsabilites?: string[]
  taches?: string[]
  exigences_diplome?: string | null
  exigences_experience?: string | null
  exigences_autres?: string | null
  version?: string
}

function DynamicList({
  label, items, placeholder, onChange,
}: {
  label: string
  items: string[]
  placeholder: string
  onChange: (items: string[]) => void
}) {
  const inputCls = `flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={e => {
                const updated = [...items]
                updated[i] = e.target.value
                onChange(updated)
              }}
              placeholder={placeholder}
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="w-8 h-9 flex items-center justify-center text-slate-400
                         hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, ''])}
          className="flex items-center gap-1.5 text-xs text-[#1B3A6B] hover:underline font-medium"
        >
          <Plus size={12} /> Ajouter
        </button>
      </div>
    </div>
  )
}

export default function FicheFonctionEditor({
  orgId,
  positionId,
  existingFiche,
}: {
  orgId: string
  positionId: string
  existingFiche: Fiche | null
}) {
  const router   = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [saved,   setSaved]   = useState(false)

  const [roleDesc,       setRoleDesc]       = useState(existingFiche?.role_description ?? '')
  const [missions,       setMissions]       = useState<string[]>(existingFiche?.missions ?? [])
  const [responsabilites,setResponsabilites]= useState<string[]>(existingFiche?.responsabilites ?? [])
  const [taches,         setTaches]         = useState<string[]>(existingFiche?.taches ?? [])
  const [diplome,        setDiplome]        = useState(existingFiche?.exigences_diplome ?? '')
  const [experience,     setExperience]     = useState(existingFiche?.exigences_experience ?? '')
  const [autres,         setAutres]         = useState(existingFiche?.exigences_autres ?? '')
  const [version,        setVersion]        = useState(existingFiche?.version ?? '1.0')

  const inputCls = `w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSaved(false)

    const payload = {
      organization_id:     orgId,
      position_id:         positionId,
      role_description:    roleDesc.trim() || null,
      missions:            missions.filter(m => m.trim()),
      responsabilites:     responsabilites.filter(r => r.trim()),
      taches:              taches.filter(t => t.trim()),
      exigences_diplome:   diplome.trim() || null,
      exigences_experience:experience.trim() || null,
      exigences_autres:    autres.trim() || null,
      version:             version.trim() || '1.0',
      updated_at:          new Date().toISOString(),
    }

    let err
    if (existingFiche?.id) {
      const res = await supabase.from('org_fiches_fonction').update(payload).eq('id', existingFiche.id)
      err = res.error
    } else {
      const res = await supabase.from('org_fiches_fonction').insert(payload)
      err = res.error
    }

    if (err) { setError(err.message); setLoading(false); return }
    setSaved(true)
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Rôle */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Rôle & Description
          </h2>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">Version</label>
            <input
              type="text"
              value={version}
              onChange={e => setVersion(e.target.value)}
              className="w-16 px-2 py-1 border border-slate-300 rounded text-xs text-center
                         focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
            />
          </div>
        </div>
        <textarea
          value={roleDesc}
          onChange={e => setRoleDesc(e.target.value)}
          placeholder="Décrivez le rôle général et la raison d'être du poste..."
          rows={4}
          className={`${inputCls} resize-none`}
        />
      </section>

      {/* Missions */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Missions</h2>
        <DynamicList
          label=""
          items={missions}
          placeholder="Ex: Piloter la mise en œuvre du SMQ"
          onChange={setMissions}
        />
      </section>

      {/* Responsabilités */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Responsabilités</h2>
        <DynamicList
          label=""
          items={responsabilites}
          placeholder="Ex: Garantir la conformité aux exigences ISO 21001"
          onChange={setResponsabilites}
        />
      </section>

      {/* Tâches */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Tâches principales</h2>
        <DynamicList
          label=""
          items={taches}
          placeholder="Ex: Préparer et animer la revue de direction"
          onChange={setTaches}
        />
      </section>

      {/* Exigences */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Exigences du poste
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Niveau de diplôme requis
            </label>
            <input
              type="text"
              value={diplome}
              onChange={e => setDiplome(e.target.value)}
              placeholder="Ex: Bac+5 en management / ingénierie"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Expérience requise
            </label>
            <input
              type="text"
              value={experience}
              onChange={e => setExperience(e.target.value)}
              placeholder="Ex: Minimum 5 ans dans un poste similaire"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Autres exigences (compétences, langue, certifications...)
            </label>
            <textarea
              value={autres}
              onChange={e => setAutres(e.target.value)}
              placeholder="Ex: Maîtrise de l'arabe et du français · Connaissance des normes ANEAQ"
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>
      </section>

      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}
      {saved && <p className="text-sm text-emerald-600 bg-emerald-50 px-4 py-3 rounded-lg">✓ Fiche enregistrée</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-[#1B3A6B] text-white rounded-lg text-sm font-medium
                     hover:bg-[#2E5BA8] transition-colors disabled:opacity-50">
          {loading ? 'Enregistrement...' : existingFiche?.id ? 'Mettre à jour' : 'Créer la fiche'}
        </button>
        <a href={`/org/${orgId}/support/rh/poste/${positionId}`}
          className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
          Annuler
        </a>
      </div>
    </form>
  )
}
