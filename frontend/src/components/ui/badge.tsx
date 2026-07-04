import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export type BadgeTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'neutralAlt'

const badgeVariants = cva(
  'inline-flex items-center gap-[7px] rounded-full px-[13px] py-1.5 text-[13px] font-semibold leading-none',
  {
    variants: {
      tone: {
        success: 'bg-success-bg text-success-dark',
        danger: 'bg-danger-bg text-danger-dark',
        warning: 'bg-warning-bg text-warning-fg',
        info: 'bg-info-bg text-[#144C8F]',
        neutral: 'bg-[#EEF0F3] text-ink-muted',
        neutralAlt: 'bg-[#EAEEF3] text-[#4A5A6E]',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

const dotColor: Record<BadgeTone, string> = {
  success: '#1E9E5A',
  danger: '#E4572E',
  warning: '#E0A400',
  info: '#1E5AA8',
  neutral: '#8A94A6',
  neutralAlt: '#6B7C93',
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Mostra o ponto colorido à esquerda (padrão). Use `icon` para substituir por um ícone. */
  dot?: boolean
  icon?: React.ReactNode
}

export function Badge({ className, tone = 'neutral', dot = true, icon, children, ...props }: BadgeProps) {
  const t = (tone ?? 'neutral') as BadgeTone
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {icon ? (
        <span className="grid place-items-center text-[15px]" style={{ color: dotColor[t] }}>
          {icon}
        </span>
      ) : (
        dot && <span className="size-2 rounded-full" style={{ backgroundColor: dotColor[t] }} />
      )}
      {children}
    </span>
  )
}
