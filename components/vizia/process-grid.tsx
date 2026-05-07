import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ProcessItem {
  label: string
  name: string
  href: string
  icon: LucideIcon
  desc?: string
  active?: boolean
}

interface ProcessGridProps {
  items: ProcessItem[]
  cols?: number
  className?: string
}

export function ProcessGrid({ items, cols = 7, className }: ProcessGridProps) {
  return (
    <div className={cn(
      `grid gap-2`,
      cols === 7 ? 'grid-cols-3 sm:grid-cols-4 xl:grid-cols-7' :
      cols === 4 ? 'grid-cols-2 sm:grid-cols-4' :
      'grid-cols-2 sm:grid-cols-3',
      className
    )}>
      {items.map(({ label, name, href, icon: Icon, desc, active }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'group flex flex-col items-center gap-2 px-2 py-4 rounded-[var(--vz-radius-lg)]',
            'text-center transition-colors',
            active
              ? 'bg-[#1B3A6B] text-white'
              : 'bg-[#F8FAFC] hover:bg-[#1B3A6B]'
          )}
        >
          <span className={cn(
            'text-[10px] font-bold font-mono',
            active ? 'text-blue-200' : 'text-[#94A3B8] group-hover:text-blue-300'
          )}>
            {label}
          </span>
          <Icon size={20} className={cn(
            'transition-colors',
            active ? 'text-white' : 'text-[#94A3B8] group-hover:text-white'
          )} />
          <p className={cn(
            'text-xs font-semibold leading-tight transition-colors',
            active ? 'text-white' : 'text-[#334155] group-hover:text-white'
          )}>
            {name}
          </p>
          {desc && (
            <p className={cn(
              'text-[10px] leading-tight transition-colors',
              active ? 'text-blue-200' : 'text-[#94A3B8] group-hover:text-blue-200'
            )}>
              {desc}
            </p>
          )}
        </Link>
      ))}
    </div>
  )
}
