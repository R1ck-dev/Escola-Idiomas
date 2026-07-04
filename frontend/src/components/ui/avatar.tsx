import { cn } from '@/lib/utils'

function iniciais(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

interface AvatarProps {
  nome: string
  className?: string
  /** Sobre fundo escuro (navy) usa translúcido; padrão usa brand sólido. */
  onDark?: boolean
  /** Fundo #EAF0F7 (navy-50) com iniciais #123A66 (brand): padrão dos avatares de conteúdo. */
  tint?: boolean
}

export function Avatar({ nome, className, onDark = false, tint = false }: AvatarProps) {
  return (
    <div
      className={cn(
        'grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold',
        onDark ? 'bg-white/14 text-white' : tint ? 'bg-navy-50 text-brand' : 'bg-brand text-white',
        className,
      )}
      aria-hidden
    >
      {iniciais(nome) || '?'}
    </div>
  )
}
