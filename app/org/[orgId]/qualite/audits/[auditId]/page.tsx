'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  AUDIT_PROCESSES, AUDIT_STATUS_META, AUDIT_CHECKLIST,
  FINDING_TYPE_META, type AuditStatus, type FindingType,
} from '@/lib/audit-templates'
import { ArrowLeft, Plus, Trash2, CheckCircle2, User } from 'lucide-react'

interface Finding {
  id: string
  finding_type: FindingType
  process_area: string | null
  description: string
  corrective_action: string | null
}

export default function AuditDetailPage() {
  const params   = useParams<{ orgId: string; auditId: string }>()
  const { orgId, auditId } = params
  const router   = useRouter()
  const supabase = createClient()

  const [audit,    setAudit]    = useState<any>(null)
  const [findings, setFindings] = useState<Finding[]>([])
  const [loading,  setLoading]  = useState(true)

  const [showForm,   setShowForm]   = useState(false)
  const [newType,    setNewType]    = useState<FindingType>('conforme')
  const [newDesc,    setNewDesc]    = useState('')
  const [newAction,  setNewAction]  = useState('')
  const [newArea,    setNewArea]    = useState('')
  const [saving,     setSaving]     = useState(false)

  const [editAuditor, setEditAuditor] = useState('')
  const [editDate,    setEditDate]    = useState('')
  const [showEditInfo, setShowEditInfo] = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: a }, { data: f }] = await Promise.all([
        supabase.from('audit_plans').select('*').eq('id', auditId).single(),
        supabase.from('audit_findings').select('*').eq('audit_plan_id', auditId).order('created_at'),
      ])
      if (a) { setAudit(a); setEditAuditor(a.auditor ?? ''); setEditDate(a.audit_date ?? '') }
      setFindings(f ?? [])
      setLoading(false)
    }
    load()
  }, [auditId])

  async function updateStatus(status: AuditStatus) {
    await supabase.from('audit_plans').update({ status }).eq('id', auditId)
    setAudit((prev: any) => ({ ...prev, status }))
  }

  async function saveInfo() {
    await supabase.from('audit_plans').update({
      auditor:    editAuditor || null,
      audit_date: editDate || null,
    }).eq('id', auditId)
    setAudit((prev: any) => ({ ...prev, auditor: editAuditor, audit_date: editDate }))
    setShowEditInfo(false)
  }

  async function addFinding() {
    if (!newDesc.trim()) return
    setSaving(true)
    const { data, error } = await supabase.from('audit_findings').insert({
      audit_plan_id:     auditId,
      organization_id:   orgId,
      finding_type:      newType,
      description:       newDesc.trim(),
      corrective_action: newAction.trim() || null,
      process_area:      newArea.trim() || null,
    }).select().single()
    if (!error && data) {
      setFindings(prev => [...prev, data as Finding])
      setNewDesc(''); setNewAction(''); setNewArea(''); setShowForm(false)
    }
    setSaving(false)
  }

  async function deleteFinding(id: string) {
    await supabase.from('audit_findings').delete().eq('id', id)
    setFindings(prev => prev.filter(f => f.id !== id))
  }

  if (loading) return <div className="p-8 text-slate-400 text-sm">Chargement...</div>
  if (!audit)  return <div className="p-8 text-slate-400 text-sm">Audit introuvable.</div>

  const proc      = AUDIT_PROCESSES.find(p => p.key === audit.process_key)
  const stMeta    = AUDIT_STATUS_META[audit.status as AuditStatus]
  const checklist = AUDIT_CHECKLIST[audit.process_key] ?? []

  const ncCount  = findings.filter(f => f.finding_type === 'mineure' || f.finding_type === 'majeure').length
  const obsCount = findings.filter(f => f.finding_type === 'observation').length
  const okCount  = findings.filter(f => f.finding_type === 'conforme').length

  const inputCls = `w-full px-3 py-2 border border-slate-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent`

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/org/${orgId}/qualite/audits`}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-2">
          <ArrowLeft size={13} /> Programme d'audits
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{proc?.icon}</span>
              <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {proc?.ref}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stMeta?.cls}`}>
                {stMeta?.label}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{audit.title}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
              {audit.audit_date && (
                <span>{new Date(audit.audit_date).toLocaleDateString('fr-FR')}</span>
              )}
              {audit.auditor && <span>· Auditeur : {audit.auditor}</span>}
              {ncCount > 0 && (
                <span className="text-amber-600 font-medium">
                  · {ncCount} NC relevée{ncCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Colonne gauche : statut + checklist */}
        <div className="space-y-4">

          {/* Statut + Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
            <div>
              <p className="text-xs text-slate-500 font-medium mb-2">Statut</p>
              <div className="flex flex-col gap-1.5">
                {(['planifie','en_cours','realise'] as AuditStatus[]).map(s => {
                  const m = AUDIT_STATUS_META[s]
                  return (
                    <button key={s} onClick={() => updateStatus(s)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                        audit.status === s
                          ? 'bg-[#1B3A6B] border-[#1B3A6B] text-white'
                          : `${m.cls} hover:opacity-80`
                      }`}>
                      {m.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Auditeur / Date */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500 font-medium">Auditeur & Date</p>
                <button onClick={() => setShowEditInfo(v => !v)}
                  className="text-[11px] text-[#1B3A6B] hover:underline">
                  Modifier
                </button>
              </div>
              {showEditInfo ? (
                <div className="space-y-2">
                  <input type="text" value={editAuditor} onChange={e => setEditAuditor(e.target.value)}
                    placeholder="Nom de l'auditeur" className={inputCls} />
                  <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)}
                    className={inputCls} />
                  <div className="flex gap-2">
                    <button onClick={saveInfo}
                      className="px-3 py-1.5 bg-[#1B3A6B] text-white rounded-lg text-xs font-medium">
                      OK
                    </button>
                    <button onClick={() => setShowEditInfo(false)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs">
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 space-y-0.5">
                  <p><span className="font-medium">Auditeur :</span> {audit.auditor ?? '—'}</p>
                  <p><span className="font-medium">Date :</span> {audit.audit_date ? new Date(audit.audit_date).toLocaleDateString('fr-FR') : '—'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Grille checklist */}
          {checklist.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-700 mb-3">Grille de vérification</p>
              <div className="space-y-2">
                {checklist.map((q, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="shrink-0 w-4 h-4 rounded border border-slate-200 bg-slate-50
                                     flex items-center justify-center mt-0.5">
                      <span className="text-[9px] text-slate-400 font-bold">{i + 1}</span>
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite : constats */}
        <div className="lg:col-span-2 space-y-4">

          {/* Résumé */}
          {findings.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'NC',           value: ncCount,  cls: 'text-red-600     bg-red-50     border-red-200' },
                { label: 'Observations', value: obsCount, cls: 'text-blue-600    bg-blue-50    border-blue-200' },
                { label: 'Conformes',    value: okCount,  cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
              ].map(({ label, value, cls }) => (
                <div key={label} className={`rounded-xl border p-3 text-center ${cls}`}>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs font-medium">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Liste constats */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800 text-sm">Constats d'audit</h2>
              <button onClick={() => setShowForm(v => !v)}
                className="flex items-center gap-1.5 text-xs text-[#1B3A6B] hover:underline font-medium">
                <Plus size={12} /> Ajouter
              </button>
            </div>

            {showForm && (
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 space-y-3">
                <div className="flex gap-2 flex-wrap">
                  {(['conforme','observation','mineure','majeure'] as FindingType[]).map(t => {
                    const meta = FINDING_TYPE_META[t]
                    return (
                      <button key={t} type="button" onClick={() => setNewType(t)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          newType === t ? 'bg-[#1B3A6B] border-[#1B3A6B] text-white' : `${meta.cls} hover:opacity-80`
                        }`}>
                        {meta.icon} {meta.label}
                      </button>
                    )
                  })}
                </div>
                <input type="text" value={newArea} onChange={e => setNewArea(e.target.value)}
                  placeholder="Zone / Processus (optionnel)" className={inputCls} />
                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2}
                  placeholder="Description du constat *" className={`${inputCls} resize-none`} />
                {newType !== 'conforme' && (
                  <textarea value={newAction} onChange={e => setNewAction(e.target.value)} rows={2}
                    placeholder="Action corrective proposée..." className={`${inputCls} resize-none`} />
                )}
                <div className="flex gap-2">
                  <button onClick={addFinding} disabled={saving || !newDesc.trim()}
                    className="px-4 py-2 bg-[#1B3A6B] text-white rounded-lg text-xs font-medium
                               hover:bg-[#2E5BA8] disabled:opacity-50">
                    {saving ? 'Ajout...' : 'Ajouter le constat'}
                  </button>
                  <button onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs hover:bg-slate-100">
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {findings.length === 0 && !showForm ? (
              <div className="px-5 py-10 text-center">
                <CheckCircle2 size={32} className="text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Aucun constat enregistré</p>
                <p className="text-xs text-slate-300 mt-0.5">Ajoutez les constats après réalisation de l'audit</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {findings.map(f => {
                  const meta = FINDING_TYPE_META[f.finding_type]
                  return (
                    <div key={f.id} className="px-5 py-3.5 flex items-start gap-3 group hover:bg-slate-50">
                      <span className={`shrink-0 mt-0.5 px-2 py-0.5 rounded border text-xs font-medium whitespace-nowrap ${meta.cls}`}>
                        {meta.icon} {meta.label}
                      </span>
                      <div className="flex-1 min-w-0">
                        {f.process_area && (
                          <p className="text-[10px] text-slate-400 font-medium mb-0.5">{f.process_area}</p>
                        )}
                        <p className="text-sm text-slate-700 leading-relaxed">{f.description}</p>
                        {f.corrective_action && (
                          <p className="text-xs text-slate-500 mt-1 italic">→ {f.corrective_action}</p>
                        )}
                      </div>
                      <button onClick={() => deleteFinding(f.id)}
                        className="shrink-0 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
