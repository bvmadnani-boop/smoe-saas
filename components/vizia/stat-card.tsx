import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: number | string
  sub?: string
  icon: LucideIcon
  href?: string
  iconClass?: string
  alert?: boolean
  className?: string
}

function StatCardInner({
  label, value, sub, icon: Icon, iconClass = 'bg-blue-50 text-blue-600', alert,
}: Omit<StatCardProps, 'href' | 'className'>) {
  return (
    <>
      <div className={cn(
        'w-11 h-11 rounded-[var(--vz-radius-lg)] flex items-center justify-center shrink-0',
        iconClass
      )}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className={cn(
          'text-2xl font-bold leading-tight',
          alert ? 'text-amber-600' : 'text-[#0F172A]'
        )}>
          {value}
        </p>
        <p className="text-xs font-semibold text-[#334155] leading-tight group-hover:text-[#1B3A6B] transition-colors">
          {label}
        </p>
        {sub && (
          <p className="text-[10px] text-[#94A3B8] leading-tight truncate">{sub}</p>
        )}
      </div>
    </>
  )
}

export function StatCard({ href, className, ...props }: StatCardProps) {
  const base = cn(
    'bg-white rounded-[var(--vz-radius-xl)] border border-[#E2E8F0] p-5',
    'flex items-center gap-4',
    href && 'hover:shadow-[var(--vz-shadow)] transition-shadow group cursor-pointer',
    props.alert && 'border-amber-200',
    className
  )

  if (href) {
    return (
      <Link href={href} className={base}>
        <StatCardInner {...props} />
      </Link>
    )
  }
  return (
    <div className={base}>
      <StatCardInner {...props} />
    </div>
  )
}
