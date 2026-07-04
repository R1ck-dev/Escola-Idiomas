import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  Books,
  CalendarBlank,
  ChalkboardTeacher,
  ClipboardText,
  House,
  List,
  SignOut,
  Wallet,
  X,
} from '@phosphor-icons/react'
import { Logo } from '@/components/Logo'
import { Avatar } from '@/components/ui/avatar'
import { useAuth } from '@/auth/AuthContext'
import { useDashboard } from '@/api/gestao'
import { cn } from '@/lib/utils'

interface NavItemDef {
  to: string
  label: string
  icon: typeof House
  end?: boolean
}

const NAV: NavItemDef[] = [
  { to: '/gestao', label: 'Início', icon: House, end: true },
  { to: '/gestao/matriculas', label: 'Matrículas', icon: ClipboardText },
  { to: '/gestao/turmas', label: 'Turmas', icon: Books },
  { to: '/gestao/professores', label: 'Professores', icon: ChalkboardTeacher },
  { to: '/gestao/financeiro', label: 'Financeiro', icon: Wallet },
  { to: '/gestao/semestres', label: 'Semestres', icon: CalendarBlank },
]

function NavItems({ pendentes, onNavigate }: { pendentes: number; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'relative flex items-center gap-3 rounded px-3.5 py-3 text-[15px] transition',
              isActive
                ? 'bg-white/10 font-semibold text-white'
                : 'font-medium text-navy-200 hover:bg-white/5 hover:text-white',
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && <span className="absolute inset-y-2.5 left-0 w-[3px] rounded-sm bg-accent" />}
              <Icon size={20} weight={isActive ? 'fill' : 'regular'} className={isActive ? 'text-accent' : ''} />
              <span className="flex-1">{label}</span>
              {to === '/gestao/matriculas' && pendentes > 0 && (
                <span className="grid min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[12px] font-bold tabular text-ink">
                  {pendentes}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function UserFooter() {
  const { user, logout } = useAuth()
  return (
    <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
      <Avatar nome={user?.nome ?? '?'} onDark className="size-9" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-white">{user?.nome}</div>
        <div className="text-xs text-navy-300">Gestão</div>
      </div>
      <button onClick={logout} aria-label="Sair" className="text-navy-300 transition hover:text-white">
        <SignOut size={20} />
      </button>
    </div>
  )
}

/** Layout da gestão: sidebar navy (desktop) + drawer (mobile). Back-office denso porém arejado. */
export function GestaoLayout() {
  const { logout } = useAuth()
  const { data: dashboard } = useDashboard()
  const pendentes = dashboard?.solicitacoesPendentes ?? 0
  const [drawer, setDrawer] = useState(false)

  return (
    <div className="min-h-screen bg-canvas md:grid md:grid-cols-[272px_1fr]">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen flex-col bg-navy-950 p-5 md:flex">
        <div className="px-1.5 py-2">
          <Logo onDark size="sm" />
        </div>
        <div className="mt-6 flex-1">
          <NavItems pendentes={pendentes} />
        </div>
        <UserFooter />
      </aside>

      {/* Drawer mobile */}
      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-navy-950/50" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[272px] max-w-[85vw] flex-col bg-navy-950 p-5">
            <div className="flex items-center justify-between px-1.5 py-2">
              <Logo onDark size="sm" />
              <button onClick={() => setDrawer(false)} aria-label="Fechar menu" className="text-navy-300 hover:text-white">
                <X size={22} />
              </button>
            </div>
            <div className="mt-6 flex-1">
              <NavItems pendentes={pendentes} onNavigate={() => setDrawer(false)} />
            </div>
            <UserFooter />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-surface px-5 py-3 md:hidden">
          <button onClick={() => setDrawer(true)} aria-label="Abrir menu" className="text-ink-muted">
            <List size={24} />
          </button>
          <Logo size="sm" />
          <button onClick={logout} aria-label="Sair" className="text-ink-muted">
            <SignOut size={20} />
          </button>
        </header>
        <main className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
