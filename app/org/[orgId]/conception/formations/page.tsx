import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Plus, BookOpen, CheckCircle2 } from 'lucide-react'
import { FORMATION_STATUT_META, type FormationStatut } from '@/lib/conception-templates'

export const dynamic = 'force-dynamic'

export default async function FormationsPage({
  params,
}: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  const supabase  = await createClient()

  const { data: formations } = await supabase
    .from('formations')
    .select('id, code, title, statut, modalite, duree_totale_heures, version, updated_at')
    .eq('organization_id', orgId)
    .order('updated_at', { ascending: false })

  const list = formations ?? []

  const statusGroups = ['valide', 'en_validation', 'brouillon', 'archive'] as FormationStatut[]

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link href={`/org/${orgId}/conception`}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-1">
            <ArrowLeft size={13} /> Conception
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Catalogue des formations</h1>
          <p className="text-slate-500 mt-1 text-sm">ISO 21001 §8.3.2/§8.3.5 — {list.length} formation{list.length > 1 ? 's' : ''}</p>
        </div>
        <Link href={`/org/${orgId}/conception/formations/new`}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white
                     rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
          <Plus size={16} /> Nouvelle formation
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
          <BookOpen size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium mb-1">Aucune formation</p>
          <p className="text-slate-400 text-sm mb-4">Créez votre première formation depuis l'un des 4 modèles pré-établis.</p>
          <Link href={`/org/${orgId}/conception/formations/new`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white
                       rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
            <Plus size={16} /> Créer depuis un modèle
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {statusGroups.map(statut => {
            const group = list.filter(f => f.statut === statut)
            if (group.length === 0) return null
            const meta = FORMATION_STATUT_META[statut]
            return (
              <div key={statut} className="bg-white rounded-xl border border-slate-200">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${meta.cls}`}>
                    {meta.label}
                  </span>
                  <span className="text-xs text-slate-400">{group.length} formation{group.length > 1 ? 's' : ''}</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {group.map(f => (
                    <Link key={f.id} href={`/org/${orgId}/conception/formations/${f.id}`}
                      className="flex items-center px-5 py-4 hover:bg-slate-50 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {f.code && (
                            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {f.code}
                            </span>
                          )}
                          <p className="text-sm font-semibold text-slate-800 group-hover:text-[#1B3A6B]">{f.title}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          {f.duree_totale_heures && <span>{f.duree_totale_heures}h</span>}
                          <span>· {f.modalite === 'presentiel' ? 'Présentiel' : f.modalite === 'hybride' ? 'Hybride' : 'Distanciel'}</span>
                          <span>· v{f.version}</span>
                        </div>
                      </div>
                      <span className="text-xs text-[#1B3A6B] opacity-0 group-hover:opacity-100 font-medium transition-opacity">
                        Ouvrir →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
