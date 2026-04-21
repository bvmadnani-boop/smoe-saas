import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, Plus, ArrowLeft, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

const DAYS = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam']
const DAY_LABELS: Record<string, string> = {
  lun: 'Lundi', mar: 'Mardi', mer: 'Mercredi',
  jeu: 'Jeudi', ven: 'Vendredi', sam: 'Samedi',
}
const TYPE_COLORS: Record<string, string> = {
  CM:    'bg-blue-50 border-blue-200 text-blue-700',
  TD:    'bg-violet-50 border-violet-200 text-violet-700',
  TP:    'bg-emerald-50 border-emerald-200 text-emerald-700',
  DS:    'bg-red-50 border-red-200 text-red-700',
  Autre: 'bg-amber-50 border-amber-200 text-amber-700',
}

export default async function EmploiDuTempsPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  const { data: schedules } = await supabase
    .from('schedules')
    .select(`
      id, day_of_week, start_time, end_time, room, type,
      courses(id, name, code),
      teachers(id, full_name)
    `)
    .eq('organization_id', orgId)
    .order('start_time', { ascending: true })

  // Grouper par jour
  const byDay: Record<string, typeof schedules> = {}
  DAYS.forEach(d => { byDay[d] = [] })
  schedules?.forEach(s => {
    const day = s.day_of_week
    if (day && byDay[day]) byDay[day].push(s)
  })

  const hasAny = schedules && schedules.length > 0

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/org/${orgId}/scolarite`}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-1">
            <ArrowLeft size={13} /> Scolarité
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Emploi du temps</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            {schedules?.length ?? 0} séance{(schedules?.length ?? 0) > 1 ? 's' : ''} programmée{(schedules?.length ?? 0) > 1 ? 's' : ''}
          </p>
        </div>
        <Link href={`/org/${orgId}/scolarite/emploi-du-temps/new`}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white
                     rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
          <Plus size={16} /> Ajouter une séance
        </Link>
      </div>

      {!hasAny ? (
        <div className="bg-white rounded-xl border border-slate-200 px-6 py-16 text-center">
          <Calendar size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium mb-1">Emploi du temps vide</p>
          <p className="text-slate-400 text-sm mb-6">Ajoutez les séances pour construire le planning.</p>
          <Link href={`/org/${orgId}/scolarite/emploi-du-temps/new`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white
                       rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors">
            <Plus size={16} /> Ajouter la première séance
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
          {DAYS.map(day => (
            <div key={day} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* En-tête jour */}
              <div className={`px-3 py-2.5 border-b border-slate-100 ${
                byDay[day]!.length > 0 ? 'bg-[#1B3A6B]' : 'bg-slate-50'
              }`}>
                <p className={`text-sm font-semibold text-center ${
                  byDay[day]!.length > 0 ? 'text-white' : 'text-slate-400'
                }`}>
                  {DAY_LABELS[day]}
                </p>
                {byDay[day]!.length > 0 && (
                  <p className="text-xs text-center text-blue-200">
                    {byDay[day]!.length} séance{byDay[day]!.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Séances du jour */}
              <div className="p-2 space-y-2 min-h-[120px]">
                {byDay[day]!.length === 0 ? (
                  <p className="text-xs text-slate-300 text-center pt-4">—</p>
                ) : (
                  byDay[day]!.map(s => {
                    const colorCls = TYPE_COLORS[s.type?.toLowerCase()] ?? 'bg-slate-50 border-slate-200 text-slate-600'
                    return (
                      <div
                        key={s.id}
                        className={`rounded-lg border p-2.5 ${colorCls}`}
                      >
                        <p className="text-xs font-semibold leading-tight truncate">
                          {(s.courses as any)?.name ?? '—'}
                        </p>
                        {(s.courses as any)?.code && (
                          <p className="text-xs opacity-70 font-mono">{(s.courses as any).code}</p>
                        )}
                        <div className="flex items-center gap-1 mt-1.5">
                          <Clock size={10} className="opacity-60 shrink-0" />
                          <p className="text-xs opacity-80">
                            {s.start_time?.slice(0,5)} – {s.end_time?.slice(0,5)}
                          </p>
                        </div>
                        {s.room && (
                          <p className="text-xs opacity-70 mt-0.5">📍 {s.room}</p>
                        )}
                        {(s.teachers as any)?.full_name && (
                          <p className="text-xs opacity-70 truncate mt-0.5">
                            👤 {(s.teachers as any).full_name}
                          </p>
                        )}
                        <span className="inline-block mt-1.5 text-xs font-medium opacity-80 uppercase tracking-wide">
                          {s.type}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
