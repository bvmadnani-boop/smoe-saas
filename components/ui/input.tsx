import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-[var(--vz-radius)] border border-[#E2E8F0] bg-white px-3 py-1 text-sm text-[#0F172A]',
        'placeholder:text-[#94A3B8] transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E5BA8]/30 focus-visible:border-[#2E5BA8]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export { Input }
