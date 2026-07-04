import * as React from 'react'
import { cn } from '@/lib/utils'

/** Tabela arejada (container com borda/rounded + scroll horizontal). */
export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(16,24,40,.04)]">
      <table className={cn('w-full border-collapse text-[15px]', className)} {...props} />
    </div>
  )
}

export function THead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-canvas', className)} {...props} />
}

export function TBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />
}

export function TR({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b border-[#F0F2F5] last:border-0', className)} {...props} />
}

export function TH({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'border-b border-line px-6 py-3.5 text-left text-[12px] font-bold uppercase tracking-[.04em] text-ink-muted',
        className,
      )}
      {...props}
    />
  )
}

export function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-6 py-[18px] align-middle', className)} {...props} />
}
