import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'min-h-24 w-full rounded border-[1.5px] border-line-strong bg-surface px-[14px] py-3 text-base text-ink transition placeholder:text-ink-subtle',
        'focus:border-navy-600 focus:outline-none focus:ring-[3px] focus:ring-navy-600/20',
        'aria-[invalid=true]:border-danger aria-[invalid=true]:bg-[#FEF6F3]',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'
