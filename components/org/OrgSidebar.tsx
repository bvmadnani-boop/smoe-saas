'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  PenTool,
  ClipboardList,
  BookOpen,
  Award,
  Briefcase,
  Lightbulb,
  ShieldCheck,
  TrendingUp,
  Wrench,
  LogOut,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'

export default function OrgSidebar({
  org,
  orgId,
  userName,
  userRole,
}: {
  org: { id: string; name: string; city?: string | null; code?: string | null }
  orgId: string
  userName: string
  userRole: string
}) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  const base = `/org/${orgId}`

  const nav = [
    { href: base,                    label: 'Tableau de bord',  icon: LayoutDashboard },
    { href: `${base}/conception`,    label: 'P2 — Conception',  icon: PenTool },
    { href: `${base}/inscription`,   label: 'P3 — Inscription', icon: ClipboardList },
    { href: `${base}/scolarite`,     label: 'P4 — Scolarité',   icon: BookOpen },
    { href: `${base}/diplomation`,   label: 'P5 — Diplomation', icon: Award },
    { href: `${base}/career-centre`, label: 'Career Centre',    icon: Briefcase },
    { href: `${base}/incubateur`,    label: 'Incubateur',       icon: Lightbulb },
    { href: `${base}/management`,    label: 'P1 — Management',  icon: TrendingUp },
    { href: `${base}/qualite`,       label: 'P6 — Amélioration', icon: ShieldCheck },
    { href: `${base}/support`,       label: 'P7 — Support',      icon: Wrench },
  ]

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-64 bg-[#1B3A6B] flex flex-col h-screen shrink-0">

      {/* Logo org */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">
              {org.code ?? org.name?.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-tight truncate">{org.name}</p>
            <p className="text-blue-300 text-xs">{org.city ?? 'SUP2I'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== base && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group ${
                active
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={15} className={active ? 'text-white' : 'text-blue-300 group-hover:text-white'} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={13} className="text-blue-300" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        {userRole === 'super_admin' && (
          <Link
            href="/admin"
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm
                       text-blue-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Retour Admin PM</span>
          </Link>
        )}
        <div className="px-3 py-1">
          <p className="text-white text-xs font-medium truncate">{userName}</p>
          <p className="text-blue-300 text-xs capitalize">{userRole.replace('_', ' ')}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm
                     text-blue-200 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={15} />
          <span>Déconnexion</span>
        </button>
      </div>

    </aside>
  )
}
