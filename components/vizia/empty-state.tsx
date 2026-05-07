import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, children, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-6 text-center', className)}>
      <div className="w-14 h-14 rounded-[var(--vz-radius-xl)] bg-slate-50 border border-[#E2E8F0] flex items-center justify-center mb-4">
        <Icon size={24} className="text-[#94A3B8]" />
      </div>
      <p className="text-sm font-semibold text-[#334155] mb-1">{title}</p>
      {description && (
        <p className="text-xs text-[#94A3B8] max-w-xs mb-4">{description}</p>
      )}
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
