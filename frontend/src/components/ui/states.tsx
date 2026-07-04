import * as React from 'react'
import { CloudWarning } from '@phosphor-icons/react'
import { Button } from './button'
import { Skeleton } from './skeleton'
import { cn } from '@/lib/utils'

/** Estado vazio: ícone-círculo + título + descrição (+ ação opcional). */
export function EmptyState({
  icon,
  title,
  description,
  action,
  tintClass = 'bg-navy-50 text-brand',
  className,
}: {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  tintClass?: string
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center px-2.5 py-[22px] text-center', className)}>
      <div className={cn('grid size-16 place-items-center rounded-full', tintClass)}>{icon}</div>
      <h3 className="mt-4 text-[17px] font-bold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-[280px] text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/** Estado de erro com botão de retentativa. */
export function ErrorState({
  title = 'Não foi possível carregar',
  description = 'Tente novamente em instantes.',
  onRetry,
  className,
}: {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3.5 rounded-2xl border border-line bg-surface p-5', className)}>
      <CloudWarning size={28} className="text-danger" />
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold text-ink">{title}</div>
        <div className="text-[13px] text-ink-muted">{description}</div>
      </div>
      {onRetry && (
        <Button variant="secondary" size="row" onClick={onRetry}>
          Tentar de novo
        </Button>
      )}
    </div>
  )
}

/** Lista de linhas em shimmer para carregamento. */
export function LoadingRows({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-2xl" />
      ))}
    </div>
  )
}
