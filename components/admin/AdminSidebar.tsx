'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  BarChart3,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from 'lucide-react'

const nav = [
  { href: '/admin',               label: 'Vue globale',       icon: LayoutDashboard },
  { href: '/admin/organisations', label: 'Organisations',     icon: Building2 },
  { href: '/admin/etudiants',     label: 'Étudiants',         icon: GraduationCap },
  { href: '/admin/utilisateurs',  label: 'Utilisateurs',      icon: Users },
  { href: '/admin/kpis',          label: 'KPIs & Rapports',   icon: BarChart3 },
  { href: '/admin/qualite',       label: 'Qualité ISO 21001', icon: ShieldCheck },
]

export default function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-64 bg-[#1B3A6B] flex flex-col h-screen shrink-0">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
            <span className="text-white font-bold text-sm">PM</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">SMOE</p>
            <p className="text-blue-300 text-xs">Proximity Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
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
              <Icon size={16} className={active ? 'text-white' : 'text-blue-300 group-hover:text-white'} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="text-blue-300" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer user */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="px-3 py-2 mb-1">
          <p className="text-white text-xs font-medium truncate">{userName}</p>
          <p className="text-blue-300 text-xs">Super Admin</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-blue-200
                     hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>

    </aside>
  )
}
