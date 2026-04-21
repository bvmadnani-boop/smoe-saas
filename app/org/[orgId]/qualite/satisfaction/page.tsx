'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Plus, Star, BarChart3, CheckCircle2, Play, X, ChevronDown } from 'lucide-react'
import {
  ENQUETE_TYPE_META, ENQUETE_STATUT_META, ENQUETE_TEMPLATES,
  type EnqueteType, type EnqueteStatut, type EnqueteQuestion,
} from '@/lib/amelioration-templates'

interface Enquete {
  id: string
  titre: string
  type: EnqueteType
  statut: EnqueteStatut
  questions: EnqueteQuestion[]
  formation_id: string | null
  periode: string | null
  date_ouverture: string | null
  date_cloture: string | null
  nb_reponses: number
  score_moyen: number | null
  resultats: Record<string, any>
  created_at: string
}

const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

export default function SatisfactionPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const supabase = createClient()

  const [items, setItems] = useState<Enquete[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [scoreModal, setScoreModal] = useState<Enquete | null>(null)
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({})

  const [selectedType, setSelectedType] = useState<EnqueteType | null>(null)
  const [form, setForm] = useState({
    titre: '',
    type: 'apprenants' as EnqueteType,
    periode: '',
    date_ouverture: '',
    date_cloture: '',
  })

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('enquetes')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [orgId])

  function selectTemplate(type: EnqueteType) {
    const tpl = ENQUETE_TEMPLATES[type]
    setSelectedType(type)
    setForm(f => ({ ...f, type, titre: tpl.titre }))
  }

  async function save() {
    if (!form.titre.trim() || !selectedType) return
    setSaving(true)
    const tpl = ENQUETE_TEMPLATES[selectedType]
    const questions = tpl.questions.map((q, i) => ({ ...q, id: `q-${i + 1}` }))
    await supabase.from('enquetes').insert({
      organization_id: orgId,
      titre: form.titre,
      type: form.type,
      statut: 'brouillon',
      questions,
      periode: form.periode || null,
      date_ouverture: form.date_ouverture || null,
      date_cloture: form.date_cloture || null,
      nb_reponses: 0,
    })
    setShowForm(false)
    setSelectedType(null)
    setForm({ titre: '', type: 'apprenants', periode: '', date_ouverture: '', date_cloture: '' })
    setSaving(false)
    load()
  }

  async function updateStatut(id: string, statut: EnqueteStatut) {
    await supabase.from('enquetes').update({ statut }).eq('id', id)
    setItems(prev => prev.map(e => e.id === id ? { ...e, statut } : e))
  }

  async function saveScores() {
    if (!scoreModal) return
    const likertQs = scoreModal.questions.filter(q => q.type === 'likert')
    const values = likertQs.map(q => parseFloat(scoreInputs[q.id] || '0')).filter(v => v > 0)
    const score_moyen = values.length > 0 ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)) : null
    const nb_reponses = parseInt(scoreInputs['nb_reponses'] || '0', 10)
    const resultats: Record<string, any> = {}
    scoreModal.questions.forEach(q => { if (scoreInputs[q.id]) resultats[q.id] = scoreInputs[q.id] })
    await supabase.from('enquetes').update({ score_moyen, nb_reponses, resultats }).eq('id', scoreModal.id)
    setScoreModal(null)
    setScoreInputs({})
    load()
  }

  const scores = items.filter(e => e.score_moyen !== null).map(e => e.score_moyen as number)
  const globalScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null

  function scoreColor(s: number | null) {
    if (!s) return 'bg-slate-200'
    if (s < 2.5) return 'bg-red-400'
    if (s < 3.5) return 'bg-amber-400'
    return 'bg-emerald-400'
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/org/${orgId}/qualite`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#1B3A6B] mb-3 transition-colors">
          <ArrowLeft size={13} /> P6 Amélioration
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Enquêtes de satisfaction</h1>
            <p className="text-slate-500 text-sm mt-0.5">ISO 21001 §9.1.2 — Surveillance de la satisfaction des parties intéressées</p>
          </div>
          <button onClick={() => setShowForm(v => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B3A6B] text-white text-sm rounded-lg hover:bg-[#2E5BA8] transition-colors">
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? 'Annuler' : 'Nouvelle enquête'}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <BarChart3 size={18} />
          </div>
          <div><p className="text-xl font-bold text-slate-900">{items.length}</p><p className="text-xs text-slate-500">Total enquêtes</p></div>
        </div>
        <div className="bg-white rounded-xl border border-emerald-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <Play size={18} />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{items.filter(e => e.statut === 'active').length}</p>
            <p className="text-xs text-slate-500">Actives</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Star size={18} />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{globalScore ? `${globalScore}/5` : '—'}</p>
            <p className="text-xs text-slate-500">Score moyen global</p>
          </div>
        </div>
      </div>

      {/* Template selector + form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
          <h2 className="font-semibold text-slate-800 text-sm mb-4">Choisir un template</h2>
          <div className="grid grid-cols-4 gap-3 mb-5">
            {(Object.entries(ENQUETE_TEMPLATES) as [EnqueteType, typeof ENQUETE_TEMPLATES[EnqueteType]][]).map(([type, tpl]) => {
              const meta = ENQUETE_TYPE_META[type]
              return (
                <button key={type} onClick={() => selectTemplate(type)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${selectedType === type ? 'border-[#1B3A6B] bg-[#1B3A6B]/5' : 'border-slate-200 hover:border-slate-300'}`}>
                  <span className="text-2xl block mb-2">{meta.icon}</span>
                  <p className="font-medium text-sm text-slate-800">{meta.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{tpl.questions.length} questions</p>
                </button>
              )
            })}
          </div>
          {selectedType && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="col-span-2">
                  <label className={labelCls}>Titre de l'enquête</label>
                  <input className={inputCls} value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Période</label>
                  <input className={inputCls} placeholder="ex: S1-2025" value={form.periode}
                    onChange={e => setForm(f => ({ ...f, periode: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelCls}>Date d'ouverture</label>
                  <input type="date" className={inputCls} value={form.date_ouverture}
                    onChange={e => setForm(f => ({ ...f, date_ouverture: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Date de clôture</label>
                  <input type="date" className={inputCls} value={form.date_cloture}
                    onChange={e => setForm(f => ({ ...f, date_cloture: e.target.value }))} />
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 mb-4">
                <p className="text-xs font-medium text-slate-500 mb-2">Questions pré-remplies ({ENQUETE_TEMPLATES[selectedType].questions.length})</p>
                <div className="space-y-1.5">
                  {ENQUETE_TEMPLATES[selectedType].questions.map((q, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="shrink-0 text-slate-400 font-mono">{i + 1}.</span>
                      <span>{q.texte}</span>
                      <span className={`ml-auto shrink-0 text-xs px-1.5 py-0.5 rounded ${q.type === 'likert' ? 'bg-blue-100 text-blue-600' : q.type === 'oui_non' ? 'bg-violet-100 text-violet-600' : 'bg-slate-200 text-slate-500'}`}>
                        {q.type === 'likert' ? '1→5' : q.type === 'oui_non' ? 'O/N' : 'Texte'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={save} disabled={saving}
                  className="px-4 py-2 bg-[#1B3A6B] text-white text-sm rounded-lg hover:bg-[#2E5BA8] disabled:opacity-50 transition-colors">
                  {saving ? 'Création...' : 'Créer l\'enquête'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Score modal */}
      {scoreModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Saisir les résultats</h2>
              <button onClick={() => setScoreModal(null)}><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Nombre de répondants</label>
                <input type="number" min="0" className={inputCls} placeholder="0"
                  value={scoreInputs['nb_reponses'] || ''}
                  onChange={e => setScoreInputs(s => ({ ...s, nb_reponses: e.target.value }))} />
              </div>
              {scoreModal.questions.filter(q => q.type === 'likert').map(q => (
                <div key={q.id}>
                  <label className={labelCls}>{q.texte}</label>
                  <div className="flex items-center gap-2">
                    <input type="number" min="1" max="5" step="0.1" className={inputCls}
                      placeholder="Score moyen (1-5)"
                      value={scoreInputs[q.id] || ''}
                      onChange={e => setScoreInputs(s => ({ ...s, [q.id]: e.target.value }))} />
                    <span className="text-xs text-slate-400 shrink-0">/5</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
              <button onClick={saveScores}
                className="px-4 py-2 bg-[#1B3A6B] text-white text-sm rounded-lg hover:bg-[#2E5BA8] transition-colors">
                Enregistrer les résultats
              </button>
              <button onClick={() => setScoreModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 transition-colors">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Chargement...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-14 text-center">
          <Star size={36} className="text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400 mb-1">Aucune enquête créée</p>
          <p className="text-xs text-slate-300">Créez votre première enquête depuis un template</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(e => {
            const typeMeta = ENQUETE_TYPE_META[e.type]
            const statMeta = ENQUETE_STATUT_META[e.statut]
            const isExpanded = expandedId === e.id

            return (
              <div key={e.id} className="bg-white rounded-xl border border-slate-200">
                <div className="flex items-center px-5 py-4 gap-4 cursor-pointer hover:bg-slate-50 rounded-xl"
                  onClick={() => setExpandedId(isExpanded ? null : e.id)}>
                  <span className="text-xl shrink-0">{typeMeta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{e.titre}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${typeMeta.cls}`}>{typeMeta.label}</span>
                      {e.periode && <span className="text-xs text-slate-400">{e.periode}</span>}
                      {e.nb_reponses > 0 && <span className="text-xs text-slate-400">{e.nb_reponses} réponses</span>}
                    </div>
                  </div>
                  {e.score_moyen && (
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-2 rounded-full ${scoreColor(e.score_moyen)}`}
                          style={{ width: `${(e.score_moyen / 5) * 100}%` }} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{e.score_moyen}<span className="text-xs text-slate-400 font-normal">/5</span></span>
                    </div>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${statMeta.cls} shrink-0`}>{statMeta.label}</span>
                  <ChevronDown size={14} className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                    <p className="text-xs text-slate-500 mb-3">{e.questions.length} questions · {e.nb_reponses} réponses</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {e.statut === 'brouillon' && (
                        <button onClick={() => updateStatut(e.id, 'active')}
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                          <Play size={11} /> Activer l'enquête
                        </button>
                      )}
                      {e.statut === 'active' && (
                        <>
                          <button onClick={() => { setScoreModal(e); setScoreInputs({ nb_reponses: String(e.nb_reponses) }) }}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#1B3A6B] text-white rounded-lg hover:bg-[#2E5BA8] transition-colors font-medium">
                            <BarChart3 size={11} /> Saisir les résultats
                          </button>
                          <button onClick={() => updateStatut(e.id, 'cloturee')}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium">
                            <CheckCircle2 size={11} /> Clôturer
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
