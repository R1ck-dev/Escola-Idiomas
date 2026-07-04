import { cn } from '@/lib/utils'

/** Placeholder com shimmer (mesma animação do design). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-md bg-[length:200%_100%] bg-[linear-gradient(90deg,#EEF0F3_25%,#F6F7F9_50%,#EEF0F3_75%)]',
        className,
      )}
    />
  )
}
