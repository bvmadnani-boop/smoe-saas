import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionCardProps {
  title: string
  icon?: LucideIcon
  iconClass?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  noPad?: boolean
}

export function SectionCard({
  title, icon: Icon, iconClass, action, children, className, noPad,
}: SectionCardProps) {
  return (
    <div className={cn(
      'bg-white rounded-[var(--vz-radius-xl)] border border-[#E2E8F0] shadow-[var(--vz-shadow-sm)]',
      className
    )}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
        <p className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
          {Icon && (
            <span className={cn(
              'w-6 h-6 rounded-md flex items-center justify-center',
              iconClass ?? 'bg-slate-100 text-[#64748B]'
            )}>
              <Icon size={13} />
            </span>
          )}
          {title}
        </p>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      <div className={noPad ? '' : 'px-5 py-4'}>{children}</div>
    </div>
  )
}
