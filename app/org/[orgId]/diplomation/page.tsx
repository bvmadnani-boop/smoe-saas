import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Award, FileText, CheckCircle2, Clock,
  ChevronRight, GraduationCap, Building2,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const PFE_STATUS: Record<string, { label: string; cls: string }> = {
  pending:     { label: 'En attente',  cls: 'bg-slate-100 text-slate-500' },
  in_progress: { label: 'En cours',   cls: 'bg-blue-50 text-blue-600' },
  submitted:   { label: 'Soumis',     cls: 'bg-violet-50 text-violet-600' },
  defended:    { label: 'Soutenu',    cls: 'bg-amber-50 text-amber-600' },
  validated:   { label: 'Validé',     cls: 'bg-emerald-50 text-emerald-600' },
  rejected:    { label: 'Rejeté',     cls: 'bg-red-50 text-red-500' },
}

const DIPLOMA_STATUS: Record<string, { label: string; cls: string }> = {
  pending:        { label: 'En attente',        cls: 'bg-slate-100 text-slate-500' },
  sup2i_approved: { label: 'Approuvé SUP2I',    cls: 'bg-blue-50 text-blue-600' },
  issued:         { label: 'Émis',              cls: 'bg-emerald-50 text-emerald-600' },
  delivered:      { label: 'Remis',             cls: 'bg-violet-50 text-violet-600' },
}

export default async function DiplomationPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  const [
    { count: nbPfe },
    { count: nbDiplomas },
    { count: nbPending },
    { data: recentPfe },
    { data: recentDiplomas },
  ] = await Promise.all([
    supabase.from('pfe_projects').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase.from('diplomas').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase.from('diplomas').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'pending'),
    supabase
      .from('pfe_projects')
      .select('id, title, status, defense_date, grade, students(full_name)')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('diplomas')
      .select('id, diploma_number, status, issue_date, sup2i_approved, students(full_name), filieres(name, code)')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">P5 — Diplomation</h1>
        <p className="text-slate-500 mt-1 text-sm">Projets de fin d'études · Diplômes · Validation SUP2I</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Projets PFE',       value: nbPfe      ?? 0, icon: FileText,    color: 'bg-blue-50 text-blue-600',    border: 'border-blue-100' },
          { label: 'Diplômes',           value: nbDiplomas ?? 0, icon: Award,       color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
          { label: 'En attente SUP2I',   value: nbPending  ?? 0, icon: Clock,       color: 'bg-amber-50 text-amber-600',  border: 'border-amber-100' },
        ].map(({ label, value, icon: Icon, color, border }) => (
          <div key={label} className={`bg-white rounded-xl border ${border} p-5 flex items-center gap-4`}>
            <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shrink-0`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* PFE */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <FileText size={15} className="text-slate-400" />
              Projets de Fin d'Études
            </h2>
            <Link href={`/org/${orgId}/diplomation/pfe`}
              className="text-xs text-[#1B3A6B] hover:underline font-medium">
              Voir tout →
            </Link>
          </div>
          {!recentPfe || recentPfe.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <FileText size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400 mb-3">Aucun projet PFE</p>
              <Link href={`/org/${orgId}/diplomation/pfe/new`}
                className="text-xs text-[#1B3A6B] hover:underline font-medium">
                + Créer un projet PFE
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentPfe.map(p => {
                const st = PFE_STATUS[p.status] ?? { label: p.status, cls: 'bg-slate-100 text-slate-500' }
                return (
                  <Link key={p.id} href={`/org/${orgId}/diplomation/pfe/${p.id}`}
                    className="flex items-center px-5 py-3.5 hover:bg-slate-50 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate group-hover:text-[#1B3A6B]">
                        {p.title}
                      </p>
                      <p className="text-xs text-slate-400">
                        {(p.students as any)?.full_name}
                        {p.defense_date && ` · Soutenance : ${new Date(p.defense_date).toLocaleDateString('fr-FR')}`}
                      </p>
                    </div>
                    <div className="ml-3 flex items-center gap-2">
                      {p.grade && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          Number(p.grade) >= 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                        }`}>
                          {Number(p.grade).toFixed(1)}/20
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>
                        {st.label}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
          <div className="px-5 py-3 border-t border-slate-50">
            <Link href={`/org/${orgId}/diplomation/pfe/new`}
              className="text-xs text-[#1B3A6B] hover:underline font-medium">
              + Nouveau projet PFE
            </Link>
          </div>
        </div>

        {/* Diplômes */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <Award size={15} className="text-slate-400" />
              Diplômes
            </h2>
            <Link href={`/org/${orgId}/diplomation/diplomes`}
              className="text-xs text-[#1B3A6B] hover:underline font-medium">
              Voir tout →
            </Link>
          </div>
          {!recentDiplomas || recentDiplomas.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Award size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400 mb-3">Aucun diplôme</p>
              <Link href={`/org/${orgId}/diplomation/diplomes/new`}
                className="text-xs text-[#1B3A6B] hover:underline font-medium">
                + Créer un diplôme
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentDiplomas.map(d => {
                const st = DIPLOMA_STATUS[d.status] ?? { label: d.status, cls: 'bg-slate-100 text-slate-500' }
                return (
                  <div key={d.id} className="flex items-center px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">
                        {(d.students as any)?.full_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {(d.filieres as any)?.code} · {d.diploma_number ?? 'N° en attente'}
                      </p>
                    </div>
                    <div className="ml-3 flex items-center gap-2">
                      {d.sup2i_approved && (
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>
                        {st.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <div className="px-5 py-3 border-t border-slate-50">
            <Link href={`/org/${orgId}/diplomation/diplomes/new`}
              className="text-xs text-[#1B3A6B] hover:underline font-medium">
              + Nouveau diplôme
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
