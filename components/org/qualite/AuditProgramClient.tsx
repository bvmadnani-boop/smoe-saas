'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  AUDIT_PROCESSES, AUDIT_STATUS_META, MOIS_LABELS,
  type AuditStatus,
} from '@/lib/audit-templates'
import { Sparkles, Loader2, ChevronRight, CalendarDays, User, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface AuditPlan {
  id: string
  process_key: string
  title: string
  status: AuditStatus
  mois_planifie: number | null
  trimestre: number | null
  auditor: string | null
  audit_date: string | null
  findings_count?: number
  nc_count?: number
}

const TRIM_LABELS = ['', 'T1 — Janv. à Mars', 'T2 — Avr. à Juin', 'T3 — Juil. à Sept.', 'T4 — Oct. à Déc.']
const TRIM_CLS    = ['', 'border-blue-200 bg-blue-50/50', 'border-violet-200 bg-violet-50/50', 'border-amber-200 bg-amber-50/50', 'border-emerald-200 bg-emerald-50/50']
const TRIM_HEAD   = ['', 'text-blue-700 bg-blue-100', 'text-violet-700 bg-violet-100', 'text-amber-700 bg-amber-100', 'text-emerald-700 bg-emerald-100']

export default function AuditProgramClient({
  orgId,
  audits: initialAudits,
}: {
  orgId: string
  audits: AuditPlan[]
}) {
  const router   = useRouter()
  const supabase = createClient()

  const [audits,  setAudits]  = useState<AuditPlan[]>(initialAudits)
  const [seeding, setSeeding] = useState(false)
  const [editId,  setEditId]  = useState<string | null>(null)
  const [editAuditor, setEditAuditor] = useState('')
  const [editDate, setEditDate] = useState('')

  // Générer le planning annuel
  async function generateProgram() {
    setSeeding(true)
    const year = new Date().getFullYear()
    const rows = AUDIT_PROCESSES.map(p => ({
      organization_id: orgId,
      process_key:     p.key,
      title:           `Audit ${p.ref} — ${p.label}`,
      status:          'planifie' as AuditStatus,
      trimestre:       p.trimestre,
      mois_planifie:   p.mois,
      audit_date:      `${year}-${String(p.mois).padStart(2,'0')}-15`,
      version:         1,
    }))

    const { data, error } = await supabase.from('audit_plans').insert(rows).select()
    if (!error && data) {
      setAudits(data as AuditPlan[])
    }
    setSeeding(false)
  }

  // Mise à jour statut inline
  async function updateStatus(id: string, status: AuditStatus) {
    await supabase.from('audit_plans').update({ status }).eq('id', id)
    setAudits(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  // Sauvegarde auditeur + date
  async function saveEdit(id: string) {
    const payload: Record<string, any> = {}
    if (editAuditor) payload.auditor    = editAuditor
    if (editDate)    payload.audit_date = editDate
    await supabase.from('audit_plans').update(payload).eq('id', id)
    setAudits(prev => prev.map(a =>
      a.id === id ? { ...a, ...payload } : a
    ))
    setEditId(null)
  }

  // Grouper par trimestre
  const byTrimestre = [1,2,3,4].map(t => ({
    trimestre: t,
    processes: AUDIT_PROCESSES.filter(p => p.trimestre === t),
    audits:    audits.filter(a => a.trimestre === t || (
      // fallback: chercher par process_key si trimestre null
      AUDIT_PROCESSES.find(p => p.key === a.process_key)?.trimestre === t
    )),
  }))

  const isEmpty = audits.length === 0

  return (
    <div className="space-y-4">

      {/* Bannière génération */}
      {isEmpty && (
        <div className="bg-[#1B3A6B]/5 border border-[#1B3A6B]/20 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <CalendarDays size={24} className="text-[#1B3A6B] shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-[#1B3A6B] text-sm">
                Générer le programme d'audit annuel {new Date().getFullYear()}
              </p>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                {AUDIT_PROCESSES.length} audits pré-planifiés sur 4 trimestres, couvrant
                l'ensemble des processus ISO 21001 — de §4 Contexte à §10 Amélioration,
                incluant les processus pédagogiques P4/P5 et la conformité SUP2I.
              </p>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {[1,2,3,4].map(t => {
                  const procs = AUDIT_PROCESSES.filter(p => p.trimestre === t)
                  return (
                    <div key={t} className={`rounded-lg border px-3 py-2 ${TRIM_CLS[t]}`}>
                      <p className={`text-[10px] font-bold uppercase ${TRIM_HEAD[t].replace('bg-','text-').split(' ')[0]}`}>
                        T{t}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {procs.length} audits
                      </p>
                      <div className="mt-1 space-y-0.5">
                        {procs.map(p => (
                          <p key={p.key} className="text-[10px] text-slate-500">
                            {p.icon} {p.label}
                          </p>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <button
              onClick={generateProgram}
              disabled={seeding}
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white
                         rounded-xl text-sm font-medium hover:bg-[#2E5BA8] transition-colors
                         disabled:opacity-50"
            >
              {seeding
                ? <><Loader2 size={15} className="animate-spin" /> Génération...</>
                : <><Sparkles size={15} /> Générer le planning</>
              }
            </button>
          </div>
        </div>
      )}

      {/* Planning par trimestre */}
      {!isEmpty && byTrimestre.map(({ trimestre, processes, audits: trimAudits }) => (
        <div key={trimestre}
          className={`rounded-xl border ${TRIM_CLS[trimestre]} overflow-hidden`}>

          {/* Header trimestre */}
          <div className={`flex items-center justify-between px-5 py-3 ${TRIM_HEAD[trimestre]}`}>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">T{trimestre}</span>
              <span className="text-sm font-medium">{TRIM_LABELS[trimestre]}</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              {trimAudits.filter(a => a.status === 'realise').length > 0 && (
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  {trimAudits.filter(a => a.status === 'realise').length} réalisé{trimAudits.filter(a => a.status === 'realise').length > 1 ? 's' : ''}
                </span>
              )}
              <span>{trimAudits.length}/{processes.length} audits</span>
            </div>
          </div>

          {/* Lignes audit */}
          <div className="divide-y divide-white/60 bg-white">
            {processes.map(proc => {
              const audit = trimAudits.find(a => a.process_key === proc.key)
              const isEditing = editId === audit?.id

              if (!audit) return null

              const stMeta  = AUDIT_STATUS_META[audit.status]
              const overdue = audit.audit_date && new Date(audit.audit_date) < new Date()
                && audit.status !== 'realise' && audit.status !== 'annule'

              return (
                <div key={proc.key} className="px-5 py-3.5">
                  <div className="flex items-center gap-3">

                    {/* Icône + Processus */}
                    <div className="w-8 text-center text-lg shrink-0">{proc.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {proc.ref}
                        </span>
                        <p className="text-sm font-medium text-slate-800 truncate">{proc.label}</p>
                        {proc.priorite === 'haute' && (
                          <span className="text-[9px] bg-red-100 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full font-bold">
                            PRIORITAIRE
                          </span>
                        )}
                      </div>
                      {/* Date + auditeur */}
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className={overdue ? 'text-red-500 font-medium' : ''}>
                          {overdue ? '⚠️ ' : ''}
                          {audit.audit_date
                            ? new Date(audit.audit_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                            : MOIS_LABELS[proc.mois]
                          }
                        </span>
                        {audit.auditor && <span>· {audit.auditor}</span>}
                      </div>
                    </div>

                    {/* Statut pills */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {(['planifie','en_cours','realise'] as AuditStatus[]).map(s => (
                        <button key={s}
                          onClick={() => updateStatus(audit.id, s)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                            audit.status === s
                              ? s === 'planifie'  ? 'bg-slate-600   border-slate-600   text-white'
                              : s === 'en_cours'  ? 'bg-amber-500   border-amber-500   text-white'
                              :                     'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white border-slate-200 text-slate-400 hover:border-slate-400'
                          }`}>
                          {s === 'planifie' ? 'Planifié' : s === 'en_cours' ? 'En cours' : 'Réalisé'}
                        </button>
                      ))}
                    </div>

                    {/* Editer auditeur */}
                    <button
                      onClick={() => { setEditId(isEditing ? null : audit.id); setEditAuditor(audit.auditor ?? ''); setEditDate(audit.audit_date ?? '') }}
                      className="shrink-0 p-1.5 text-slate-300 hover:text-slate-500 transition-colors"
                      title="Assigner un auditeur"
                    >
                      <User size={14} />
                    </button>

                    {/* Voir constats */}
                    <Link href={`/org/${orgId}/qualite/audits/${audit.id}`}
                      className="shrink-0 p-1.5 text-slate-300 hover:text-[#1B3A6B] transition-colors"
                      title="Ouvrir l'audit">
                      <ChevronRight size={16} />
                    </Link>
                  </div>

                  {/* Formulaire inline auditeur/date */}
                  {isEditing && (
                    <div className="mt-3 ml-11 flex items-center gap-2 flex-wrap">
                      <input type="text" value={editAuditor}
                        onChange={e => setEditAuditor(e.target.value)}
                        placeholder="Nom de l'auditeur"
                        className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs
                                   focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] w-48" />
                      <input type="date" value={editDate}
                        onChange={e => setEditDate(e.target.value)}
                        className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs
                                   focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" />
                      <button onClick={() => saveEdit(audit.id)}
                        className="px-3 py-1.5 bg-[#1B3A6B] text-white rounded-lg text-xs font-medium hover:bg-[#2E5BA8]">
                        OK
                      </button>
                      <button onClick={() => setEditId(null)}
                        className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs hover:bg-slate-50">
                        Annuler
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
