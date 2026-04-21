import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Plus, FileText, CheckCircle2, Archive, AlertTriangle } from 'lucide-react'
import { POLICY_STATUS_META } from '@/lib/policy-templates'

export const dynamic = 'force-dynamic'

export default async function PolitiquePage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  const { data: policies } = await supabase
    .from('quality_policies')
    .select('id, title, version, status, approver_name, approved_at, review_date, template_used, created_at')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  const activePolicy   = policies?.find(p => p.status === 'active')
  const draftPolicies  = policies?.filter(p => p.status === 'draft') ?? []
  const archivedCount  = policies?.filter(p => p.status === 'archived').length ?? 0

  // Alerte révision dépassée
  const reviewOverdue = activePolicy?.review_date
    && new Date(activePolicy.review_date) < new Date()

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link href={`/org/${orgId}/management`}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-1">
            <ArrowLeft size={13} /> Management
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Politique Qualité</h1>
          <p className="text-slate-500 mt-1 text-sm">ISO 21001 §5.2 — Engagement de la direction</p>
        </div>
        <Link href={`/org/${orgId}/management/politique/new`}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white
                     rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
          <Plus size={16} /> Nouvelle politique
        </Link>
      </div>

      {/* Alerte révision */}
      {reviewOverdue && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-5">
          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>Révision annuelle en retard</strong> — La politique active devait être révisée
            le {new Date(activePolicy.review_date!).toLocaleDateString('fr-FR')}
          </p>
          <Link href={`/org/${orgId}/management/politique/${activePolicy!.id}`}
            className="ml-auto text-xs text-amber-700 hover:underline font-medium whitespace-nowrap">
            Réviser →
          </Link>
        </div>
      )}

      {/* Politique active */}
      {activePolicy ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                    Politique active
                  </span>
                  <span className="text-xs text-slate-400 font-mono">v{activePolicy.version}</span>
                </div>
                <h2 className="font-bold text-slate-900">{activePolicy.title}</h2>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                  {activePolicy.approver_name && (
                    <span>Approuvée par <strong>{activePolicy.approver_name}</strong></span>
                  )}
                  {activePolicy.approved_at && (
                    <span>le {new Date(activePolicy.approved_at).toLocaleDateString('fr-FR')}</span>
                  )}
                  {activePolicy.review_date && (
                    <span className={reviewOverdue ? 'text-amber-600 font-medium' : ''}>
                      Révision prévue : {new Date(activePolicy.review_date).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link href={`/org/${orgId}/management/politique/${activePolicy.id}?print=1`}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-emerald-200 text-emerald-700
                           rounded-lg text-xs font-medium hover:bg-emerald-50 transition-colors">
                🖨️ Imprimer
              </Link>
              <Link href={`/org/${orgId}/management/politique/${activePolicy.id}`}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#1B3A6B] text-white
                           rounded-lg text-xs font-medium hover:bg-[#2E5BA8] transition-colors">
                Modifier →
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center mb-5">
          <FileText size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium mb-1">Aucune politique qualité active</p>
          <p className="text-slate-400 text-sm mb-4">
            Créez votre politique qualité depuis l'un des 4 modèles pré-rédigés.
          </p>
          <Link href={`/org/${orgId}/management/politique/new`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white
                       rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
            <Plus size={16} /> Créer depuis un modèle
          </Link>
        </div>
      )}

      {/* Brouillons */}
      {draftPolicies.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 mb-4">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700">
              Brouillons ({draftPolicies.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-50">
            {draftPolicies.map(p => (
              <div key={p.id} className="flex items-center px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{p.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    v{p.version} · Créée le {new Date(p.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                    Brouillon
                  </span>
                  <Link href={`/org/${orgId}/management/politique/${p.id}`}
                    className="text-xs text-[#1B3A6B] hover:underline font-medium">
                    Continuer →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compteur archivées */}
      {archivedCount > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-500">
          <Archive size={15} className="text-slate-400" />
          {archivedCount} politique{archivedCount > 1 ? 's' : ''} archivée{archivedCount > 1 ? 's' : ''}
          <span className="text-xs text-slate-400 ml-1">(versions précédentes conservées)</span>
        </div>
      )}
    </div>
  )
}
