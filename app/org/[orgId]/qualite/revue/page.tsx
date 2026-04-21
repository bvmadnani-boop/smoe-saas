import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Plus, BookOpen, CheckCircle2 } from 'lucide-react'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function RevuePage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  const { data: reviews } = await supabase
    .from('management_reviews')
    .select('*')
    .eq('organization_id', orgId)
    .order('review_date', { ascending: false })

  const list = reviews ?? []

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link href={`/org/${orgId}/qualite`}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-1">
            <ArrowLeft size={13} /> Qualité ISO
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Revue de direction</h1>
          <p className="text-slate-500 mt-1 text-sm">ISO 21001 §9.3 — Revue annuelle du SMQ</p>
        </div>
        <Link href={`/org/${orgId}/qualite/revue/new`}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white
                     rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
          <Plus size={16} /> Nouvelle revue
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
          <BookOpen size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium mb-1">Aucune revue de direction</p>
          <p className="text-slate-400 text-sm mb-4">
            La revue §9.3 analyse l'ensemble du SMQ (NCs, risques, politique, audits) et décide des axes d'amélioration.
          </p>
          <Link href={`/org/${orgId}/qualite/revue/new`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white
                       rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
            <Plus size={16} /> Préparer la revue de direction
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(r => (
            <Link key={r.id} href={`/org/${orgId}/qualite/revue/${r.id}`}
              className="flex items-center bg-white rounded-xl border border-slate-200 px-5 py-4
                         hover:border-[#1B3A6B]/30 hover:shadow-sm transition-all group">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                    r.status === 'realise'
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                      : 'bg-amber-100 text-amber-700 border-amber-300'
                  }`}>
                    {r.status === 'realise' ? '✓ Réalisée' : 'Planifiée'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">v{r.version}</span>
                </div>
                <h2 className="font-semibold text-slate-900 group-hover:text-[#1B3A6B] transition-colors">
                  {r.title}
                </h2>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                  {r.review_date && (
                    <span>{new Date(r.review_date).toLocaleDateString('fr-FR')}</span>
                  )}
                  {r.attendees && <span>· {r.attendees}</span>}
                </div>
              </div>
              <span className="text-xs text-[#1B3A6B] font-medium group-hover:underline">
                Ouvrir →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
