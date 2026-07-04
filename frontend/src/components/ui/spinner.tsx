import { cn } from '@/lib/utils'

/** Spinner circular. Herda a cor do texto (`currentColor`). */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={cn(
        'inline-block size-4 animate-spin-fast rounded-full border-2 border-current/30 border-t-current',
        className,
      )}
    />
  )
}
