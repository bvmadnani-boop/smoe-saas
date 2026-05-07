import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:  'bg-[#1B3A6B]/10 text-[#1B3A6B]',
        primary:  'bg-blue-100 text-blue-700',
        success:  'bg-emerald-50 text-emerald-700',
        warning:  'bg-amber-50 text-amber-700',
        danger:   'bg-red-50 text-red-600',
        info:     'bg-sky-50 text-sky-700',
        violet:   'bg-violet-50 text-violet-700',
        orange:   'bg-orange-50 text-orange-600',
        gold:     'bg-[#C09A3A]/10 text-[#8B6D28]',
        muted:    'bg-slate-100 text-slate-500',
        outline:  'border border-[#E2E8F0] text-[#64748B] bg-transparent',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
