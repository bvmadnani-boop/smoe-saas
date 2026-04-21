'use client'

import { getScoreLevel } from '@/lib/risk-templates'

interface RiskItem {
  id: string
  title: string
  type: string
  probability: number
  impact: number
  score: number
}

export default function RiskMatrix({ risks }: { risks: RiskItem[] }) {
  // Grouper par cellule (prob × impact)
  const byCell: Record<string, RiskItem[]> = {}
  risks.forEach(r => {
    const key = `${r.probability}-${r.impact}`
    if (!byCell[key]) byCell[key] = []
    byCell[key].push(r)
  })

  const probLabels = ['', 'Très faible', 'Faible', 'Modérée', 'Élevée', 'Quasi-certaine']
  const impLabels  = ['', 'Négligeable', 'Mineur', 'Modéré', 'Majeur', 'Catastrophique']

  function cellCls(p: number, i: number) {
    const score = p * i
    if (score >= 20) return 'bg-red-100 hover:bg-red-150 border-red-200'
    if (score >= 12) return 'bg-orange-100 hover:bg-orange-150 border-orange-200'
    if (score >= 6)  return 'bg-amber-100 hover:bg-amber-150 border-amber-200'
    return 'bg-green-100 hover:bg-green-150 border-green-200'
  }

  function scoreDotCls(score: number) {
    if (score >= 20) return 'bg-red-500'
    if (score >= 12) return 'bg-orange-400'
    if (score >= 6)  return 'bg-amber-400'
    return 'bg-green-500'
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        {/* Légende Impact (axe X) */}
        <div className="flex items-end mb-1 pl-24">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex-1 text-center text-[10px] text-slate-500 font-medium px-1 leading-tight">
              {impLabels[i]}
            </div>
          ))}
        </div>

        {/* Titre axe X */}
        <div className="flex mb-0.5 pl-24">
          <div className="flex-1 text-center text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
            Impact →
          </div>
        </div>

        {/* Grille 5×5 */}
        <div className="flex">
          {/* Axe Y Probabilité */}
          <div className="flex flex-col-reverse w-24 shrink-0 pr-2">
            {[1,2,3,4,5].map(p => (
              <div key={p} className="h-20 flex items-center justify-end">
                <span className="text-[10px] text-slate-500 font-medium text-right leading-tight">
                  {probLabels[p]}
                </span>
              </div>
            ))}
          </div>

          {/* Cellules */}
          <div className="flex-1 flex flex-col-reverse gap-px">
            {[1,2,3,4,5].map(p => (
              <div key={p} className="flex gap-px h-20">
                {[1,2,3,4,5].map(i => {
                  const key   = `${p}-${i}`
                  const items = byCell[key] ?? []
                  const score = p * i
                  return (
                    <div key={i}
                      className={`flex-1 border rounded-md flex flex-col items-center justify-start
                                  p-1 gap-0.5 transition-colors ${cellCls(p, i)}`}
                    >
                      {/* Score */}
                      <span className={`text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center
                                        text-white ${scoreDotCls(score)}`}>
                        {score}
                      </span>
                      {/* Items */}
                      <div className="flex flex-wrap gap-0.5 justify-center">
                        {items.slice(0, 4).map(r => (
                          <div key={r.id}
                            title={r.title}
                            className={`w-3.5 h-3.5 rounded-full border-2 border-white
                                        ${r.type === 'risque' ? 'bg-slate-600' : 'bg-emerald-500'}`}
                          />
                        ))}
                        {items.length > 4 && (
                          <span className="text-[9px] text-slate-500 font-bold">+{items.length - 4}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Axe Y label */}
        <div className="flex mt-1 pl-24">
          <div className="flex-1 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
            ↑ Probabilité
          </div>
        </div>

        {/* Légende */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
          {[
            { score: 1,  label: 'Faible (1–5)' },
            { score: 6,  label: 'Modéré (6–11)' },
            { score: 12, label: 'Élevé (12–19)' },
            { score: 20, label: 'Critique (20–25)' },
          ].map(({ score, label }) => {
            const meta = getScoreLevel(score)
            return (
              <div key={score} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm ${meta.bgCls}`} />
                <span className="text-xs text-slate-500">{label}</span>
              </div>
            )
          })}
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-slate-600 border border-white" />
              <span className="text-xs text-slate-500">Risque</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 border border-white" />
              <span className="text-xs text-slate-500">Opportunité</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
