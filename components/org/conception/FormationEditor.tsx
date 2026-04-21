'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  FORMATION_TEMPLATES, FORMATION_STATUT_META,
  type FormationStatut, type FormationModalite,
} from '@/lib/conception-templates'
import { Sparkles, Save, FileText, Check } from 'lucide-react'

interface Referentiel { id: string; code: string; title: string }
interface Filiere     { id: string; name: string }

export default function FormationEditor({
  orgId,
  mode,
  formation,
  referentiels,
  filieres,
}: {
  orgId: string
  mode: 'new' | 'edit'
  referentiels: Referentiel[]
  filieres: Filiere[]
  formation?: {
    id: string; code: string | null; title: string; statut: FormationStatut
    filiere_id: string | null; public_cible: string | null; prerequis: string | null
    objectifs_generaux: string | null; duree_totale_heures: number | null
    modalite: FormationModalite; referentiel_id: string | null; version: number
  }
}) {
  const router   = useRouter()
  const supabase = createClient()

  const [selectedTpl,  setSelectedTpl]  = useState('')
  const [code,         setCode]         = useState(formation?.code ?? '')
  const [title,        setTitle]        = useState(formation?.title ?? '')
  const [filiereId,    setFiliereId]    = useState(formation?.filiere_id ?? '')
  const [publicCible,  setPublicCible]  = useState(formation?.public_cible ?? '')
  const [prerequis,    setPrerequisl]   = useState(formation?.prerequis ?? '')
  const [objectifs,    setObjectifs]    = useState(formation?.objectifs_generaux ?? '')
  const [duree,        setDuree]        = useState(formation?.duree_totale_heures?.toString() ?? '')
  const [modalite,     setModalite]     = useState<FormationModalite>(formation?.modalite ?? 'presentiel')
  const [referentielId,setReferentielId]= useState(formation?.referentiel_id ?? '')
  const [statut,       setStatut]       = useState<FormationStatut>(formation?.statut ?? 'brouillon')
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')

  const inputCls = `w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`

  function applyTemplate(key: string) {
    const tpl = FORMATION_TEMPLATES.find(t => t.key === key)
    if (!tpl) return
    setSelectedTpl(key)
    setCode(tpl.code)
    setTitle(tpl.label)
    setDuree(tpl.duree.toString())
    setModalite(tpl.modalite)
    setPublicCible(tpl.public_cible)
    setPrerequisl(tpl.prerequis)
    setObjectifs(tpl.objectifs_generaux)
  }

  async function save(newStatut?: FormationStatut) {
    if (!title.trim()) { setError('Le titre est obligatoire.'); return }
    setLoading(true); setError('')
    const finalStatut = newStatut ?? statut

    const payload = {
      organization_id:    orgId,
      code:               code.trim() || null,
      title:              title.trim(),
      filiere_id:         filiereId || null,
      public_cible:       publicCible.trim() || null,
      prerequis:          prerequis.trim() || null,
      objectifs_generaux: objectifs.trim() || null,
      duree_totale_heures: duree ? parseFloat(duree) : null,
      modalite,
      referentiel_id:     referentielId || null,
      statut:             finalStatut,
    }

    if (mode === 'new') {
      const { data, error: err } = await supabase
        .from('formations').insert({ ...payload, version: 1 }).select().single()
      if (err) { setError(err.message); setLoading(false); return }
      router.push(`/org/${orgId}/conception/formations/${data.id}`)
      router.refresh()
    } else if (formation) {
      const { error: err } = await supabase
        .from('formations')
        .update({ ...payload, version: formation.version + 1, updated_at: new Date().toISOString() })
        .eq('id', formation.id)
      if (err) { setError(err.message); setLoading(false); return }
      router.refresh()
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">

      {/* Sélecteur template */}
      {mode === 'new' && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-violet-800 mb-3 flex items-center gap-2">
            <Sparkles size={15} />
            Partir d'un modèle pré-établi
            <span className="text-xs font-normal text-violet-600">→ les champs se pré-remplissent</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {FORMATION_TEMPLATES.map(t => (
              <button key={t.key} type="button" onClick={() => applyTemplate(t.key)}
                className={`text-left px-4 py-3 rounded-xl border transition-all ${
                  selectedTpl === t.key
                    ? 'bg-[#1B3A6B] border-[#1B3A6B] text-white shadow-md'
                    : 'bg-white border-slate-200 hover:border-violet-300'
                }`}>
                <p className={`text-xs font-mono font-bold mb-0.5 ${selectedTpl === t.key ? 'text-blue-200' : 'text-slate-400'}`}>
                  {t.code}
                </p>
                <p className={`text-sm font-semibold leading-tight ${selectedTpl === t.key ? 'text-white' : 'text-slate-800'}`}>
                  {t.label}
                </p>
                <p className={`text-xs mt-1 ${selectedTpl === t.key ? 'text-blue-200' : 'text-slate-400'}`}>
                  {t.duree}h · {t.modalite}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Identification */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="font-semibold text-slate-800 text-sm">§8.3.2 — Identification</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
            <input type="text" value={code} onChange={e => setCode(e.target.value)}
              placeholder="Ex: LST-INFO" className={inputCls} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Intitulé de la formation <span className="text-red-500">*</span>
            </label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Licence Sciences et Techniques — Informatique" className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Durée totale (heures)</label>
            <input type="number" value={duree} onChange={e => setDuree(e.target.value)}
              placeholder="Ex: 1500" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Modalité</label>
            <select value={modalite} onChange={e => setModalite(e.target.value as FormationModalite)}
              className={inputCls}>
              <option value="presentiel">Présentiel</option>
              <option value="hybride">Hybride</option>
              <option value="distanciel">Distanciel</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Filière associée</label>
            <select value={filiereId} onChange={e => setFiliereId(e.target.value)} className={inputCls}>
              <option value="">— Aucune —</option>
              {filieres.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Données d'entrée §8.3.3 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="font-semibold text-slate-800 text-sm">§8.3.3 — Données d'entrée</h2>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Public cible</label>
          <textarea value={publicCible} onChange={e => setPublicCible(e.target.value)} rows={3}
            placeholder="Décrire le profil des apprenants visés, leurs caractéristiques et attentes..."
            className={`${inputCls} resize-none`} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Prérequis</label>
          <textarea value={prerequis} onChange={e => setPrerequisl(e.target.value)} rows={2}
            placeholder="Conditions d'entrée : niveau académique, compétences préalables..."
            className={`${inputCls} resize-none`} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Objectifs généraux & compétences visées</label>
          <textarea value={objectifs} onChange={e => setObjectifs(e.target.value)} rows={7}
            placeholder="À l'issue de la formation, l'apprenant sera capable de :&#10;• Compétence 1&#10;• Compétence 2&#10;..."
            className={`${inputCls} resize-y font-sans text-sm leading-relaxed`} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Référentiel de compétences</label>
          <select value={referentielId} onChange={e => setReferentielId(e.target.value)} className={inputCls}>
            <option value="">— Aucun référentiel lié —</option>
            {referentiels.map(r => (
              <option key={r.id} value={r.id}>{r.code} — {r.title}</option>
            ))}
          </select>
          {referentiels.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">
              Aucun référentiel disponible —{' '}
              <a href={`/org/${orgId}/conception/referentiels`} className="underline">créez le référentiel SUP2I</a>
            </p>
          )}
        </div>
      </div>

      {/* Statut §8.3.4 */}
      {mode === 'edit' && formation && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 text-sm mb-3">§8.3.4 — Maîtrise de la conception</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {(['brouillon','en_validation','valide','archive'] as FormationStatut[]).map(s => {
              const meta = FORMATION_STATUT_META[s]
              return (
                <button key={s} type="button" onClick={() => setStatut(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    statut === s ? 'bg-[#1B3A6B] border-[#1B3A6B] text-white' : `${meta.cls} hover:opacity-80`
                  }`}>
                  {meta.label}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Version actuelle : <strong>v{formation.version}</strong> · Toute sauvegarde incrémente la version.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button onClick={() => save('brouillon')} disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg
                     text-sm font-medium hover:bg-slate-200 disabled:opacity-50 transition-colors">
          <FileText size={15} />
          {loading ? 'Enregistrement...' : 'Brouillon'}
        </button>
        <button onClick={() => save('en_validation')} disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white rounded-lg
                     text-sm font-medium hover:bg-[#2E5BA8] disabled:opacity-50 transition-colors">
          <Save size={15} />
          Soumettre à validation
        </button>
        <a href={`/org/${orgId}/conception/formations`}
          className="ml-auto px-5 py-2.5 bg-white border border-slate-200 text-slate-600
                     rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
          Annuler
        </a>
      </div>
    </div>
  )
}
