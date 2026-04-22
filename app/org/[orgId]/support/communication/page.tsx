import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  MessageSquare, Plus, ArrowLeft, CheckCircle2,
} from 'lucide-react'
import {
  COMM_TYPE_META, COMM_STATUT_META,
  type CommType, type CommStatut,
} from '@/lib/support-templates'

export const dynamic = 'force-dynamic'

export default async function CommunicationPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>
  searchParams: Promise<{ statut?: string; type?: string }>
}) {
  const { orgId }           = await params
  const { statut, type }    = await searchParams
  const supabase            = await createClient()

  let query = supabase
    .from('support_communications')
    .select('id, subject, type, target, channel, date_communication, statut, responsible')
    .eq('organization_id', orgId)
    .order('date_communication', { ascending: false })

  if (statut) query = query.eq('statut', statut)
  if (type)   query = query.eq('type', type)

  const { data: communications } = await query

  const { data: all } = await supabase
    .from('support_communications')
    .select('statut, type')
    .eq('organization_id', orgId)

  const total      = all?.length ?? 0
  const planifies  = all?.filter(c => c.statut === 'planifie').length ?? 0
  const envoyes    = all?.filter(c => c.statut === 'envoye' || c.statut === 'recu').length ?? 0
  const internes   = all?.filter(c => c.type === 'interne').length ?? 0
  const externes   = all?.filter(c => c.type === 'externe').length ?? 0

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/org/${orgId}/support`}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-1">
            <ArrowLeft size={13} /> Support §7
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Plan de communication</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            ISO 21001 §7.4 — Communications internes & externes
          </p>
        </div>
        <Link href={`/org/${orgId}/support/communication/new`}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white
                     rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
          <Plus size={16} /> Nouvelle communication
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total',         value: total,     cls: 'border-slate-200',   iconCls: 'bg-slate-100  text-slate-500'   },
          { label: 'Planifiées',    value: planifies,  cls: 'border-amber-100',   iconCls: 'bg-amber-50   text-amber-600'   },
          { label: 'Réalisées',     value: envoyes,   cls: 'border-emerald-100', iconCls: 'bg-emerald-50 text-emerald-600' },
          { label: 'Externes',      value: externes,  cls: 'border-violet-100',  iconCls: 'bg-violet-50  text-violet-600'  },
        ].map(({ label, value, cls, iconCls }) => (
          <div key={label} className={`bg-white rounded-xl border ${cls} p-5 flex items-center gap-4`}>
            <div className={`w-11 h-11 rounded-xl ${iconCls} flex items-center justify-center shrink-0`}>
              <MessageSquare size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rappel ISO §7.4 */}
      <div className="bg-[#1B3A6B]/5 border border-[#1B3A6B]/15 rounded-xl px-5 py-4 mb-5">
        <p className="text-xs text-[#1B3A6B] font-semibold mb-1">ISO 21001 §7.4 — Exigences communication</p>
        <p className="text-xs text-slate-600 leading-relaxed">
          L'organisme doit déterminer les communications internes et externes pertinentes :
          <strong> Quoi</strong> communiquer · <strong>Quand</strong> · <strong>À qui</strong> · <strong>Comment</strong> · <strong>Qui</strong> communique.
        </p>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { key: '',         label: 'Tous',       count: total },
          { key: 'planifie', label: 'Planifiées', count: planifies },
          { key: 'envoye',   label: 'Envoyées',   count: all?.filter(c => c.statut === 'envoye').length ?? 0 },
          { key: 'recu',     label: 'Reçues',     count: all?.filter(c => c.statut === 'recu').length ?? 0 },
          { key: 'archive',  label: 'Archivées',  count: all?.filter(c => c.statut === 'archive').length ?? 0 },
        ].map(({ key, label, count }) => (
          <Link key={key}
            href={`/org/${orgId}/support/communication${key ? `?statut=${key}` : ''}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              (statut ?? '') === key
                ? 'bg-[#1B3A6B] text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-[#1B3A6B]'
            }`}>
            {label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              (statut ?? '') === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>{count}</span>
          </Link>
        ))}
        <span className="text-slate-200 text-xs mx-1 self-center">|</span>
        {(Object.entries(COMM_TYPE_META) as [CommType, any][]).map(([key, meta]) => (
          <Link key={key}
            href={`/org/${orgId}/support/communication?type=${key}${statut ? `&statut=${statut}` : ''}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              type === key ? meta.cls : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
            }`}>
            {meta.label}
          </Link>
        ))}
      </div>

      {/* Table / Liste */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {!communications || communications.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <MessageSquare size={44} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium mb-1">Aucune communication enregistrée</p>
            <p className="text-slate-400 text-sm mb-5">
              {statut || type ? 'Aucun résultat.' : 'Documentez votre plan de communication ISO §7.4.'}
            </p>
            {!statut && !type && (
              <Link href={`/org/${orgId}/support/communication/new`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white
                           rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
                <Plus size={16} /> Créer la première communication
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Sujet</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Destinataire</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden xl:table-cell">Canal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {communications.map(c => {
                const typeMeta   = COMM_TYPE_META[c.type as CommType]
                  ?? { label: c.type, cls: 'bg-slate-100 text-slate-500 border-slate-200' }
                const statutMeta = COMM_STATUT_META[c.statut as CommStatut]
                  ?? { label: c.statut, cls: 'bg-slate-100 text-slate-500 border-slate-200' }
                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-slate-800">{c.subject}</p>
                      {c.responsible && (
                        <p className="text-xs text-slate-400">👤 {c.responsible}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium ${typeMeta.cls}`}>
                        {typeMeta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 hidden lg:table-cell">
                      {c.target ?? '—'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 hidden xl:table-cell">
                      {c.channel ?? '—'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 hidden lg:table-cell">
                      {c.date_communication
                        ? new Date(c.date_communication).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statutMeta.cls}`}>
                        {statutMeta.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
