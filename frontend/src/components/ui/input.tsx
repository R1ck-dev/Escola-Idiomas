import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'h-12 w-full rounded border-[1.5px] border-line-strong bg-surface px-[14px] text-base text-ink transition placeholder:text-ink-subtle',
        'focus:border-navy-600 focus:outline-none focus:ring-[3px] focus:ring-navy-600/20',
        'aria-[invalid=true]:border-danger aria-[invalid=true]:bg-[#FEF6F3] aria-[invalid=true]:focus:ring-danger/20',
        'disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-muted',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
