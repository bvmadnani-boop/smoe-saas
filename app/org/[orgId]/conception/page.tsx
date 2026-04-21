import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, BookOpen, CheckCircle2, AlertTriangle, ChevronRight, Library, FileText } from 'lucide-react'
import { FORMATION_STATUT_META, type FormationStatut } from '@/lib/conception-templates'

export const dynamic = 'force-dynamic'

export default async function ConceptionPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  const [
    { data: formations },
    { data: referentiels },
  ] = await Promise.all([
    supabase.from('formations')
      .select('id, code, title, statut, modalite, duree_totale_heures, version, updated_at')
      .eq('organization_id', orgId)
      .order('updated_at', { ascending: false }),
    supabase.from('referentiels_competences')
      .select('id, code, title, source')
      .eq('organization_id', orgId)
      .eq('is_active', true),
  ])

  const list = formations ?? []
  const refs  = referentiels ?? []

  const counts = {
    total:         list.length,
    brouillon:     list.filter(f => f.statut === 'brouillon').length,
    en_validation: list.filter(f => f.statut === 'en_validation').length,
    valide:        list.filter(f => f.statut === 'valide').length,
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">P2 — Conception & Développement</h1>
          <p className="text-slate-500 mt-1 text-sm">
            ISO 21001 §8.3 — Catalogue des formations · Plans pédagogiques · Revues de conception
          </p>
        </div>
        <Link href={`/org/${orgId}/conception/formations/new`}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white
                     rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
          <Plus size={16} /> Nouvelle formation
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total formations', value: counts.total,         cls: 'bg-white border-slate-200',    icon: BookOpen,     iconCls: 'bg-slate-50   text-slate-500' },
          { label: 'Brouillons',       value: counts.brouillon,     cls: 'bg-white border-slate-200',    icon: FileText,     iconCls: 'bg-slate-50   text-slate-400' },
          { label: 'En validation',    value: counts.en_validation, cls: 'bg-white border-amber-100',    icon: AlertTriangle,iconCls: 'bg-amber-50   text-amber-500' },
          { label: 'Validées',         value: counts.valide,        cls: 'bg-white border-emerald-100',  icon: CheckCircle2, iconCls: 'bg-emerald-50 text-emerald-500' },
        ].map(({ label, value, cls, icon: Icon, iconCls }) => (
          <div key={label} className={`rounded-xl border ${cls} p-5 flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-xl ${iconCls} flex items-center justify-center shrink-0`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Catalogue formations */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <BookOpen size={15} className="text-slate-400" />
              Catalogue des formations
            </h2>
            <Link href={`/org/${orgId}/conception/formations`}
              className="text-xs text-[#1B3A6B] hover:underline font-medium">
              Voir tout →
            </Link>
          </div>

          {list.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <BookOpen size={36} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-3">Aucune formation conçue</p>
              <Link href={`/org/${orgId}/conception/formations/new`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B3A6B] text-white
                           rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
                <Plus size={14} /> Créer depuis un modèle
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {list.slice(0, 8).map(f => {
                const stMeta = FORMATION_STATUT_META[f.statut as FormationStatut]
                return (
                  <Link key={f.id}
                    href={`/org/${orgId}/conception/formations/${f.id}`}
                    className="flex items-center px-5 py-3.5 hover:bg-slate-50 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {f.code && (
                          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {f.code}
                          </span>
                        )}
                        <p className="text-sm font-medium text-slate-800 truncate group-hover:text-[#1B3A6B]">
                          {f.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        {f.duree_totale_heures && <span>{f.duree_totale_heures}h</span>}
                        <span className="capitalize">· {f.modalite}</span>
                        <span>· v{f.version}</span>
                      </div>
                    </div>
                    <span className={`shrink-0 ml-3 text-xs px-2 py-0.5 rounded-full font-medium border ${stMeta.cls}`}>
                      {stMeta.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}

          <div className="px-5 py-3 border-t border-slate-50">
            <Link href={`/org/${orgId}/conception/formations/new`}
              className="text-xs text-[#1B3A6B] hover:underline font-medium">
              + Nouvelle formation
            </Link>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="space-y-4">

          {/* Modules ISO §8.3 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 text-sm mb-4">Modules §8.3</h2>
            <div className="space-y-2">
              {[
                { label: 'Catalogue formations',  href: `/org/${orgId}/conception/formations`,   ref: '§8.3.2', icon: '📚' },
                { label: 'Référentiels compétences', href: `/org/${orgId}/conception/referentiels`, ref: '§8.3.3', icon: '🎯' },
              ].map(m => (
                <Link key={m.href} href={m.href}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg
                             bg-[#1B3A6B]/5 border border-[#1B3A6B]/10
                             hover:bg-[#1B3A6B]/10 transition-colors group">
                  <div className="flex items-center gap-2">
                    <span>{m.icon}</span>
                    <span className="text-sm font-medium text-[#1B3A6B]">{m.label}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#1B3A6B] font-semibold">
                    <span className="font-mono">{m.ref}</span>
                    <ChevronRight size={12} />
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-400 leading-relaxed">
                Le plan pédagogique et les revues §8.3.4 sont accessibles depuis chaque fiche formation.
              </p>
            </div>
          </div>

          {/* Référentiels */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <Library size={14} className="text-slate-400" />
                Référentiels actifs
              </h2>
              <Link href={`/org/${orgId}/conception/referentiels`}
                className="text-xs text-[#1B3A6B] hover:underline font-medium">
                Gérer →
              </Link>
            </div>
            {refs.length === 0 ? (
              <p className="text-xs text-slate-400">Aucun référentiel — créez le référentiel SUP2I.</p>
            ) : (
              <div className="space-y-1.5">
                {refs.map(r => (
                  <div key={r.id} className="flex items-center justify-between">
                    <span className="text-xs text-slate-700 font-medium">{r.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      r.source === 'sup2i'  ? 'bg-[#1B3A6B]/10 text-[#1B3A6B]' :
                      r.source === 'rncp'   ? 'bg-violet-100 text-violet-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {r.source}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
