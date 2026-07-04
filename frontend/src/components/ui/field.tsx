import * as React from 'react'
import { WarningCircle } from '@phosphor-icons/react'
import { Label } from './label'
import { cn } from '@/lib/utils'

interface FieldProps {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}

/** Campo de formulário: rótulo + controle + ajuda/erro inline (padrão do design). */
export function Field({ label, htmlFor, error, hint, required, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={htmlFor} className={cn(error && 'text-[#C8461F]')}>
        {label}
        {required && <span className="text-danger"> *</span>}
      </Label>
      {children}
      {error ? (
        <p className="flex items-center gap-1.5 text-[13px] font-medium text-[#C8461F]">
          <WarningCircle weight="fill" size={15} />
          {error}
        </p>
      ) : hint ? (
        <p className="text-[13px] text-ink-muted">{hint}</p>
      ) : null}
    </div>
  )
}
