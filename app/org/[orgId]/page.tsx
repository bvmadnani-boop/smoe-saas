import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import {
  GraduationCap, PenTool, BookOpen,
  AlertTriangle, Rocket, TrendingUp,
  Megaphone, ClipboardList, Award, ShieldCheck, Wrench,
  Briefcase, Lightbulb,
} from 'lucide-react'
import Link from 'next/link'

import { PageHeader, StatCard, SectionCard, ProcessGrid, EmptyState } from '@/components/vizia'
import { Avatar, Badge } from '@/components/ui'
import type { ProcessItem } from '@/components/vizia'

export const dynamic = 'force-dynamic'

export default async function OrgDashboard({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase  = await createClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, city')
    .eq('id', orgId)
    .single()

  if (!org) notFound()

  const [
    { count: nbStudents },
    { count: nbInscrits },
    { count: nbFormations },
    { count: nbReferentiels },
    { count: nbNC },
    { count: nbProjets },
    { data: recentStudents },
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'inscrit'),
    supabase.from('formations').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase.from('referentiels_competences').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('is_active', true),
    supabase.from('nonconformities').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'ouverte'),
    supabase.from('incubateur_projets').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).neq('stade', 'abandonne'),
    supabase
      .from('students')
      .select('id, student_code, full_name, status, created_at')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const processus: ProcessItem[] = [
    { label: 'P1', name: 'Management',   href: `/org/${orgId}/management`,  icon: Megaphone,     desc: 'Pilotage & stratégie' },
    { label: 'P2', name: 'Conception',   href: `/org/${orgId}/conception`,   icon: PenTool,       desc: 'Formations & référentiels' },
    { label: 'P3', name: 'Inscription',  href: `/org/${orgId}/inscription`,  icon: ClipboardList, desc: 'Dossiers étudiants' },
    { label: 'P4', name: 'Scolarité',    href: `/org/${orgId}/scolarite`,    icon: BookOpen,      desc: 'Suivi pédagogique' },
    { label: 'P5', name: 'Diplomation',  href: `/org/${orgId}/diplomation`,  icon: Award,         desc: 'Diplômes & PFE' },
    { label: 'P6', name: 'Amélioration', href: `/org/${orgId}/qualite`,      icon: ShieldCheck,   desc: 'Qualité & conformité' },
    { label: 'P7', name: 'Support',      href: `/org/${orgId}/support`,      icon: Wrench,        desc: 'RH · Infra · Docs' },
  ]

  const statusLabel: Record<string, { label: string; variant: 'violet' | 'success' | 'primary' | 'danger' | 'muted' }> = {
    inscrit:  { label: 'Inscrit',  variant: 'violet' },
    actif:    { label: 'Actif',    variant: 'success' },
    diplome:  { label: 'Diplômé', variant: 'primary' },
    suspendu: { label: 'Suspendu', variant: 'danger' },
    inactif:  { label: 'Inactif',  variant: 'muted' },
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Tableau de bord"
        subtitle={`${org.name}${org.city ? ` — ${org.city}` : ''} · Vue générale`}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="Étudiants"
          value={nbStudents ?? 0}
          sub={`${nbInscrits ?? 0} inscrits actifs`}
          icon={GraduationCap}
          iconClass="bg-emerald-50 text-emerald-600"
          href={`/org/${orgId}/inscription`}
        />
        <StatCard
          label="Formations"
          value={nbFormations ?? 0}
          sub="Programmes actifs"
          icon={PenTool}
          iconClass="bg-blue-50 text-blue-600"
          href={`/org/${orgId}/conception/formations`}
        />
        <StatCard
          label="Référentiels"
          value={nbReferentiels ?? 0}
          sub="Référentiels compétences"
          icon={BookOpen}
          iconClass="bg-violet-50 text-violet-600"
          href={`/org/${orgId}/conception/referentiels`}
        />
        <StatCard
          label="NC ouvertes"
          value={nbNC ?? 0}
          sub="Non-conformités"
          icon={AlertTriangle}
          iconClass={(nbNC ?? 0) > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}
          alert={(nbNC ?? 0) > 0}
          href={`/org/${orgId}/qualite/non-conformites`}
        />
        <StatCard
          label="Projets"
          value={nbProjets ?? 0}
          sub="En incubation"
          icon={Rocket}
          iconClass="bg-orange-50 text-orange-500"
          href={`/org/${orgId}/incubateur/projets`}
        />
      </div>

      {/* Processus ISO 21001 */}
      <SectionCard
        title="Processus ISO 21001"
        icon={TrendingUp}
        className="mb-4"
      >
        <ProcessGrid items={processus} cols={7} />
      </SectionCard>

      {/* Modules transverses */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          {
            name: 'Career Centre',
            href: `/org/${orgId}/career-centre`,
            icon: Briefcase,
            desc: 'Offres, mentoring, entreprises',
            cls: 'hover:border-sky-300',
          },
          {
            name: 'Incubateur',
            href: `/org/${orgId}/incubateur`,
            icon: Lightbulb,
            desc: 'Startups, projets, incubation',
            cls: 'hover:border-orange-300',
          },
        ].map(({ name, href, icon: Icon, desc, cls }) => (
          <Link
            key={href}
            href={href}
            className={`bg-white rounded-[var(--vz-radius-xl)] border border-[#E2E8F0] p-5
                        flex items-center gap-4 transition-all hover:shadow-[var(--vz-shadow)] group ${cls}`}
          >
            <div className="w-10 h-10 rounded-[var(--vz-radius-lg)] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0">
              <Icon size={18} className="text-[#64748B] group-hover:text-[#1B3A6B] transition-colors" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0F172A] group-hover:text-[#1B3A6B] transition-colors">{name}</p>
              <p className="text-xs text-[#94A3B8]">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Étudiants récents */}
      <SectionCard
        title="Étudiants récents"
        icon={GraduationCap}
        noPad
        action={
          <Link href={`/org/${orgId}/inscription`} className="text-xs text-[#2E5BA8] hover:underline font-medium">
            Voir tout →
          </Link>
        }
      >
        {!recentStudents || recentStudents.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="Aucun étudiant inscrit"
            description="Inscrivez votre premier étudiant pour commencer."
          >
            <Link
              href={`/org/${orgId}/inscription/new`}
              className="text-sm text-[#1B3A6B] hover:underline font-medium"
            >
              + Inscrire le premier étudiant
            </Link>
          </EmptyState>
        ) : (
          <div className="divide-y divide-[#F1F5F9]">
            {recentStudents.map((s) => {
              const st = statusLabel[s.status] ?? { label: s.status, variant: 'muted' as const }
              return (
                <Link
                  key={s.id}
                  href={`/org/${orgId}/inscription/${s.id}`}
                  className="flex items-center px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors group"
                >
                  <Avatar name={s.full_name} size="sm" className="mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0F172A] group-hover:text-[#1B3A6B] transition-colors">
                      {s.full_name}
                    </p>
                    <p className="text-xs text-[#94A3B8]">{s.student_code}</p>
                  </div>
                  <Badge variant={st.variant}>{st.label}</Badge>
                </Link>
              )
            })}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
