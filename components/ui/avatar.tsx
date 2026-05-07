import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const avatarVariants = cva(
  'rounded-full flex items-center justify-center shrink-0 font-bold select-none',
  {
    variants: {
      size: {
        sm:  'w-7 h-7 text-[10px]',
        md:  'w-9 h-9 text-xs',
        lg:  'w-11 h-11 text-sm',
        xl:  'w-14 h-14 text-base',
      },
      color: {
        navy:    'bg-[#1B3A6B]/12 text-[#1B3A6B]',
        blue:    'bg-blue-100 text-blue-700',
        emerald: 'bg-emerald-100 text-emerald-700',
        violet:  'bg-violet-100 text-violet-700',
        orange:  'bg-orange-100 text-orange-700',
        slate:   'bg-slate-100 text-slate-600',
      },
    },
    defaultVariants: { size: 'md', color: 'navy' },
  }
)

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('')
}

export interface AvatarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof avatarVariants> {
  name?: string
}

function Avatar({ className, size, color, name, children, ...props }: AvatarProps) {
  return (
    <div className={cn(avatarVariants({ size, color: color ?? 'navy' }), className)} {...props}>
      {children ?? (name ? initials(name) : '?')}
    </div>
  )
}

export { Avatar }
