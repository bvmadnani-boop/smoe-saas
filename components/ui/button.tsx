import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E5BA8] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:     'bg-[#1B3A6B] text-white hover:bg-[#152E55]',
        primary:     'bg-[#2E5BA8] text-white hover:bg-[#1B3A6B]',
        outline:     'border border-[#E2E8F0] bg-white text-[#334155] hover:bg-[#F1F5F9] hover:border-[#CBD5E1]',
        ghost:       'text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0F172A]',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        gold:        'bg-[#C09A3A] text-white hover:bg-[#A8842E]',
        link:        'text-[#2E5BA8] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm:   'h-8 rounded-[var(--vz-radius-sm)] px-3 text-xs gap-1.5',
        md:   'h-9 rounded-[var(--vz-radius)] px-4',
        lg:   'h-10 rounded-[var(--vz-radius-lg)] px-5 text-base',
        icon: 'h-9 w-9 rounded-[var(--vz-radius)]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
