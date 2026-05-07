import Link from 'next/link'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

type ModuleStatus = 'ok' | 'empty' | 'warning' | 'error'

interface ModuleCardProps {
  href: string
  label: string
  ref_?: string
  icon: LucideIcon
  iconClass?: string
  desc?: string
  stats?: string
  status?: ModuleStatus
  className?: string
}

const statusBadge: Record<ModuleStatus, { label: string; variant: 'success' | 'muted' | 'warning' | 'danger' }> = {
  ok:      { label: 'Configuré',    variant: 'success' },
  empty:   { label: 'Non renseigné', variant: 'muted' },
  warning: { label: 'À revoir',     variant: 'warning' },
  error:   { label: 'Erreur',       variant: 'danger' },
}

export function ModuleCard({
  href, label, ref_, icon: Icon, iconClass = 'bg-blue-100 text-blue-600',
  desc, stats, status, className,
}: ModuleCardProps) {
  const badge = status ? statusBadge[status] : null

  return (
    <Link
      href={href}
      className={cn(
        'group bg-white rounded-[var(--vz-radius-xl)] border border-[#E2E8F0] p-5',
        'flex items-center gap-4 hover:shadow-[var(--vz-shadow)] hover:border-[#CBD5E1] transition-all',
        className
      )}
    >
      <div className={cn(
        'w-10 h-10 rounded-[var(--vz-radius-lg)] flex items-center justify-center shrink-0',
        iconClass
      )}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {ref_ && (
            <span className="text-[10px] font-bold font-mono text-[#94A3B8]">{ref_}</span>
          )}
          <p className="text-sm font-semibold text-[#0F172A] group-hover:text-[#1B3A6B] transition-colors">
            {label}
          </p>
          {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
        </div>
        {desc && <p className="text-xs text-[#64748B]">{desc}</p>}
        {stats && <p className="text-[11px] text-[#94A3B8] mt-0.5 truncate">{stats}</p>}
      </div>
      <ChevronRight size={15} className="text-[#CBD5E1] group-hover:text-[#1B3A6B] transition-colors shrink-0" />
    </Link>
  )
}
