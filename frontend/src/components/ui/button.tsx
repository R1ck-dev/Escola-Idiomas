import * as React from 'react'
import { Slot, Slottable } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Spinner } from './spinner'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-navy-600/40 disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-subtle disabled:shadow-none',
  {
    variants: {
      variant: {
        primary: 'rounded bg-brand text-white shadow-[0_1px_2px_rgba(12,42,77,.2)] hover:bg-brand-dark',
        cta: 'rounded bg-accent font-bold text-ink shadow-[0_1px_2px_rgba(245,183,10,.3)] hover:bg-accent-hover',
        secondary:
          'rounded border-[1.5px] border-line-strong bg-surface text-brand hover:border-brand hover:bg-navy-50',
        ghost: 'rounded bg-transparent text-navy-600 hover:underline disabled:bg-transparent',
        destructive: 'rounded bg-danger text-white hover:bg-[#c8461f]',
      },
      size: {
        default: 'min-h-12 px-[22px] text-base',
        sm: 'min-h-11 px-5 text-[15px]',
        row: 'min-h-10 rounded-[9px] px-4 text-sm',
        save: 'min-h-[50px] rounded-[12px] px-6 text-base shadow-[0_2px_6px_rgba(245,183,10,.3)]',
        icon: 'size-11 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled ?? loading}
        {...props}
      >
        {loading && <Spinner />}
        <Slottable>{children}</Slottable>
      </Comp>
    )
  },
)
Button.displayName = 'Button'

export { buttonVariants }
