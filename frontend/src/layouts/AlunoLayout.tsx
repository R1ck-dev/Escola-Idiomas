import { NavLink, Outlet } from 'react-router-dom'
import { BookOpen, ChartBar, House, SignOut, Wallet } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/auth/AuthContext'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: Icon
  end?: boolean
}

const items: NavItem[] = [
  { to: '/aluno', label: 'Início', icon: House, end: true },
  { to: '/aluno/turmas', label: 'Turmas', icon: BookOpen },
  { to: '/aluno/boletim', label: 'Notas', icon: ChartBar },
  { to: '/aluno/financeiro', label: 'Financeiro', icon: Wallet },
]

/** Layout do aluno/pais: mobile-first, cabeçalho enxuto + navegação inferior (app de banco). */
export function AlunoLayout() {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Logo size="sm" />
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-sm font-medium text-ink-muted transition hover:bg-surface-2 hover:text-ink"
          >
            <SignOut size={18} />
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-28 pt-5">
        <Outlet />
      </main>

      {/* Bottom-nav */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-[env(safe-area-inset-bottom)]">
        <div className="mb-3 flex w-full max-w-lg gap-1 rounded-2xl border border-line bg-surface p-2.5 shadow-[0_1px_2px_rgba(16,24,40,.04)]">
          {items.map(({ to, label, icon: Ico, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-xl py-2 transition',
                  isActive ? 'text-brand' : 'text-ink-subtle hover:text-ink',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Ico size={24} weight={isActive ? 'fill' : 'regular'} />
                  <span className={cn('text-xs', isActive ? 'font-bold' : 'font-medium')}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
