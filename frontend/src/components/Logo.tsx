import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  onDark?: boolean
  symbolOnly?: boolean
  className?: string
}

const box = { sm: 'size-[38px] rounded-[11px]', md: 'size-[42px] rounded-xl', lg: 'size-16 rounded-[18px]' }
const bubble = { sm: 'h-3.5 w-5', md: 'h-4 w-[23px]', lg: 'h-6 w-[34px]' }
const tail = { sm: 'size-[7px]', md: 'size-2', lg: 'size-3' }
const word = { sm: 'text-[15px]', md: 'text-lg', lg: 'text-2xl' }

/** Wordmark da escola: símbolo (balão de fala = idioma) + nome. */
export function Logo({ size = 'md', onDark = false, symbolOnly = false, className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('grid shrink-0 place-items-center bg-brand shadow-[0_6px_18px_rgba(18,58,102,.22)]', box[size])}>
        <div className="relative">
          <div className={cn('rounded-[7px] bg-accent', bubble[size])} />
          <div className={cn('absolute -bottom-[3px] left-1 rotate-45 rounded-[2px] bg-accent', tail[size])} />
        </div>
      </div>
      {!symbolOnly && (
        <span className={cn('font-extrabold tracking-[-.01em]', word[size], onDark ? 'text-white' : 'text-brand')}>
          Escola
          <span className={cn('font-medium', onDark ? 'text-navy-300' : 'text-ink-muted')}> de Idiomas</span>
        </span>
      )}
    </div>
  )
}
