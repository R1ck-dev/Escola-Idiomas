import { cn } from '@/lib/utils'

export interface ToggleChipOption {
  value: string
  label: string
}

export interface ToggleChipsProps {
  options: ToggleChipOption[]
  value: string[]
  onChange: (next: string[]) => void
  className?: string
  name?: string
  'aria-label'?: string
}

/** Seleção de múltiplos valores em chips toggláveis (pills). Controlado por value/onChange. */
export function ToggleChips({
  options,
  value,
  onChange,
  className,
  name,
  'aria-label': ariaLabel,
}: ToggleChipsProps) {
  const toggle = (v: string) => {
    onChange(value.includes(v) ? value.filter((item) => item !== v) : [...value, v])
  }

  return (
    <div role="group" aria-label={ariaLabel} className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => {
        const active = value.includes(option.value)
        return (
          <button
            key={option.value}
            type="button"
            name={name}
            value={option.value}
            aria-pressed={active}
            onClick={() => toggle(option.value)}
            className={cn(
              'select-none whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-navy-600/30',
              active
                ? 'border-brand bg-navy-50 text-brand'
                : 'border-line text-ink-muted hover:border-line-strong',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
