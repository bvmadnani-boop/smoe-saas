'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  SUP2I_COMPETENCES_TEMPLATE, BLOOM_META,
  type NiveauBloom, type ReferentielSource,
} from '@/lib/conception-templates'
import { ArrowLeft, Plus, Sparkles, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

interface Competence {
  id: string; code: string; bloc: string | null; title: string
  niveau_bloom: NiveauBloom | null; description: string | null
}
interface Referentiel {
  id: string; code: string; title: string; source: ReferentielSource
  description: string | null; competences?: Competence[]
}

export default function ReferentielsPage() {
  const params = useParams<{ orgId: string }>()
  const { orgId } = params
  const supabase = createClient()

  const [refs,    setRefs]    = useState<Referentiel[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [expanded,setExpanded]= useState<Record<string, boolean>>({})
  const [showNewRef, setShowNewRef] = useState(false)

  const [newRefCode,  setNewRefCode]  = useState('')
  const [newRefTitle, setNewRefTitle] = useState('')
  const [newRefSource,setNewRefSource]= useState<ReferentielSource>('maison')
  const [newRefDesc,  setNewRefDesc]  = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: r }, { data: c }] = await Promise.all([
      supabase.from('referentiels_competences').select('*').eq('organization_id', orgId).eq('is_active', true),
      supabase.from('competences').select('*').eq('organization_id', orgId).order('ordre'),
    ])
    const refList = (r ?? []) as Referentiel[]
    const compList = (c ?? []) as Competence[]
    const withComps = refList.map(ref => ({
      ...ref,
      competences: compList.filter(comp => (comp as any).referentiel_id === ref.id),
    }))
    setRefs(withComps)
    setLoading(false)
  }

  async function seedSup2i() {
    setSeeding(true)
    const tpl = SUP2I_COMPETENCES_TEMPLATE
    const { data: ref } = await supabase.from('referentiels_competences').insert({
      organization_id: orgId,
      code:            tpl.code,
      title:           tpl.title,
      source:          tpl.source,
      description:     tpl.description,
    }).select().single()
    if (!ref) { setSeeding(false); return }

    const rows = tpl.blocs.flatMap((bloc, bi) =>
      bloc.competences.map((c, ci) => ({
        referentiel_id:  ref.id,
        organization_id: orgId,
        code:            c.code,
        bloc:            bloc.bloc,
        title:           c.title,
        niveau_bloom:    c.niveau_bloom,
        ordre:           bi * 100 + ci,
      }))
    )
    await supabase.from('competences').insert(rows)
    await load()
    setSeeding(false)
  }

  async function addRef() {
    if (!newRefTitle.trim()) return
    setSaving(true)
    const { data } = await supabase.from('referentiels_competences').insert({
      organization_id: orgId,
      code:   newRefCode.trim() || newRefTitle.slice(0, 6).toUpperCase(),
      title:  newRefTitle.trim(),
      source: newRefSource,
      description: newRefDesc.trim() || null,
    }).select().single()
    if (data) {
      setRefs(prev => [...prev, { ...data, competences: [] }])
      setNewRefCode(''); setNewRefTitle(''); setNewRefDesc('')
      setShowNewRef(false)
    }
    setSaving(false)
  }

  async function deleteRef(id: string) {
    if (!confirm('Supprimer ce référentiel et toutes ses compétences ?')) return
    await supabase.from('referentiels_competences').update({ is_active: false }).eq('id', id)
    setRefs(prev => prev.filter(r => r.id !== id))
  }

  const inputCls = `w-full px-3 py-2 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`

  if (loading) return <div className="p-8 text-sm text-slate-400">Chargement...</div>

  const hasSup2i = refs.some(r => r.source === 'sup2i')

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link href={`/org/${orgId}/conception`}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-1">
            <ArrowLeft size={13} /> Conception
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Référentiels de compétences</h1>
          <p className="text-slate-500 mt-1 text-sm">ISO 21001 §8.3.3 — Données d'entrée de la conception</p>
        </div>
        <button onClick={() => setShowNewRef(v => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white
                     rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
          <Plus size={16} /> Nouveau référentiel
        </button>
      </div>

      {/* Seeder SUP2I */}
      {!hasSup2i && (
        <div className="bg-[#1B3A6B]/5 border border-[#1B3A6B]/20 rounded-xl p-5 mb-6 flex items-start gap-4">
          <Sparkles size={20} className="text-[#1B3A6B] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-[#1B3A6B] text-sm">Référentiel SUP2I officiel</p>
            <p className="text-slate-600 text-xs mt-1">
              3 blocs · 16 compétences transversales, méthodologiques et d'insertion professionnelle —
              pré-codées avec taxonomie de Bloom. Base de toutes vos formations SUP2I.
            </p>
          </div>
          <button onClick={seedSup2i} disabled={seeding}
            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-[#1B3A6B] text-white
                       rounded-lg text-sm font-medium hover:bg-[#2E5BA8] disabled:opacity-50">
            {seeding ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {seeding ? 'Import...' : 'Importer SUP2I'}
          </button>
        </div>
      )}

      {/* Formulaire nouveau référentiel */}
      {showNewRef && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-5 space-y-3">
          <p className="text-sm font-semibold text-slate-700">Nouveau référentiel</p>
          <div className="grid grid-cols-3 gap-3">
            <input type="text" value={newRefCode} onChange={e => setNewRefCode(e.target.value)}
              placeholder="Code (ex: RNCP-35)" className={inputCls} />
            <input type="text" value={newRefTitle} onChange={e => setNewRefTitle(e.target.value)}
              placeholder="Intitulé *" className={`${inputCls} col-span-2`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={newRefSource} onChange={e => setNewRefSource(e.target.value as ReferentielSource)} className={inputCls}>
              <option value="maison">Maison</option>
              <option value="sup2i">SUP2I</option>
              <option value="rncp">RNCP</option>
              <option value="sectoriel">Sectoriel</option>
            </select>
            <input type="text" value={newRefDesc} onChange={e => setNewRefDesc(e.target.value)}
              placeholder="Description (optionnel)" className={inputCls} />
          </div>
          <div className="flex gap-2">
            <button onClick={addRef} disabled={saving || !newRefTitle.trim()}
              className="px-4 py-2 bg-[#1B3A6B] text-white rounded-lg text-sm font-medium hover:bg-[#2E5BA8] disabled:opacity-50">
              Créer
            </button>
            <button onClick={() => setShowNewRef(false)}
              className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-sm hover:bg-slate-100">
              Annuler
            </button>
          </div>
        </div>
      )}

      {refs.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <p className="text-slate-400 text-sm">Aucun référentiel — importez le référentiel SUP2I.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {refs.map(ref => {
            const isOpen = expanded[ref.id] !== false
            const blocs = [...new Set(ref.competences?.map(c => c.bloc).filter(Boolean))]
            return (
              <div key={ref.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center px-5 py-4 gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {ref.code}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        ref.source === 'sup2i' ? 'bg-[#1B3A6B]/10 text-[#1B3A6B]' :
                        ref.source === 'rncp'  ? 'bg-violet-100 text-violet-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>{ref.source}</span>
                      <p className="font-semibold text-slate-800 text-sm">{ref.title}</p>
                    </div>
                    <p className="text-xs text-slate-400">
                      {ref.competences?.length ?? 0} compétences · {blocs.length} blocs
                    </p>
                  </div>
                  <button onClick={() => setExpanded(p => ({ ...p, [ref.id]: !isOpen }))}
                    className="p-1.5 text-slate-400 hover:text-slate-600">
                    {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                  <button onClick={() => deleteRef(ref.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>

                {isOpen && ref.competences && ref.competences.length > 0 && (
                  <div className="border-t border-slate-50">
                    {blocs.map(bloc => (
                      <div key={bloc as string}>
                        <div className="px-5 py-2 bg-slate-50 border-b border-slate-100">
                          <p className="text-xs font-semibold text-slate-600">{bloc as string}</p>
                        </div>
                        {ref.competences!.filter(c => c.bloc === bloc).map(c => {
                          const bMeta = c.niveau_bloom ? BLOOM_META[c.niveau_bloom] : null
                          return (
                            <div key={c.id} className="flex items-center px-5 py-2.5 hover:bg-slate-50 gap-3 border-b border-slate-50 last:border-0">
                              <span className="text-[10px] font-mono font-bold text-slate-400 w-12 shrink-0">{c.code}</span>
                              <p className="text-sm text-slate-700 flex-1">{c.title}</p>
                              {bMeta && (
                                <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium ${bMeta.cls}`}>
                                  {bMeta.label}
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
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
