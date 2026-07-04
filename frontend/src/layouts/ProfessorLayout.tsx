import { useState } from 'react'
import { NavLink, Outlet, useOutletContext } from 'react-router-dom'
import {
  CaretDown,
  ChalkboardTeacher,
  GraduationCap,
  List,
  ListChecks,
  NotePencil,
  SignOut,
  X,
} from '@phosphor-icons/react'
import { Logo } from '@/components/Logo'
import { Avatar } from '@/components/ui/avatar'
import { useAuth } from '@/auth/AuthContext'
import { cn } from '@/lib/utils'

interface HeaderState {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

interface ProfessorOutletContext {
  setHeader: (header: HeaderState) => void
}

/** Hook para as páginas alimentarem a topbar desktop do layout do professor. */
export function useProfessorHeader() {
  return useOutletContext<ProfessorOutletContext>()
}

interface NavItemDef {
  to: string
  label: string
  icon: typeof ChalkboardTeacher
  end?: boolean
}

const NAV: NavItemDef[] = [
  { to: '/professor', label: 'Minhas turmas', icon: ChalkboardTeacher, end: true },
  { to: '/professor/chamada', label: 'Chamada', icon: ListChecks },
  { to: '/professor/notas', label: 'Notas', icon: NotePencil },
  { to: '/professor/boletins', label: 'Boletins', icon: GraduationCap },
]

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-[3px]">
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
              {isActive && <span className="absolute inset-y-2.5 left-0 w-[3px] rounded-[2px] bg-accent" />}
              <Icon size={20} weight={isActive ? 'fill' : 'regular'} className={isActive ? 'text-accent' : ''} />
              {label}
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
    <div className="mt-4 flex items-center gap-[11px] border-t border-white/10 pt-4">
      <Avatar nome={user?.nome ?? '?'} onDark className="size-[38px]" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-white">{user?.nome}</div>
        <div className="text-xs text-navy-300">Professora</div>
      </div>
      <button onClick={logout} aria-label="Sair" className="text-navy-300 transition hover:text-white">
        <SignOut size={20} />
      </button>
    </div>
  )
}

/** Layout do professor: sidebar navy (desktop) + barra superior (mobile). */
export function ProfessorLayout() {
  const { user, logout } = useAuth()
  const [header, setHeader] = useState<HeaderState>({})
  const [drawer, setDrawer] = useState(false)

  return (
    <div className="min-h-screen bg-canvas md:grid md:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col bg-navy-950 py-5 px-3.5 md:flex">
        <div className="pt-1.5 px-2.5 pb-5">
          <Logo onDark size="sm" />
        </div>
        <div className="flex-1">
          <SidebarNav />
        </div>
        <UserFooter />
      </aside>

      {/* Drawer mobile */}
      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-navy-950/50" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[272px] max-w-[85vw] flex-col bg-navy-950 py-5 px-3.5">
            <div className="flex items-center justify-between pt-1.5 px-2.5 pb-5">
              <Logo onDark size="sm" />
              <button onClick={() => setDrawer(false)} aria-label="Fechar menu" className="text-navy-300 hover:text-white">
                <X size={22} />
              </button>
            </div>
            <div className="flex-1">
              <SidebarNav onNavigate={() => setDrawer(false)} />
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
          <button onClick={logout} className="flex items-center gap-1.5 text-sm font-medium text-ink-muted">
            <SignOut size={18} /> Sair
          </button>
        </header>

        <header className="hidden h-[76px] flex-none items-center gap-4 border-b border-line bg-surface px-8 md:flex">
          <div className="min-w-0 flex-1">
            {header.title && (
              <div className="truncate text-[20px] font-bold tracking-[-.01em] text-ink">{header.title}</div>
            )}
            {header.subtitle && <div className="text-[13px] text-ink-subtle">{header.subtitle}</div>}
          </div>
          {header.actions ?? (
            <div className="flex items-center gap-2">
              <Avatar nome={user?.nome ?? '?'} className="size-10" />
              <CaretDown size={18} className="text-ink-subtle" />
            </div>
          )}
        </header>

        <main className="flex-1 px-5 py-7 md:px-8">
          <Outlet context={{ setHeader } satisfies ProfessorOutletContext} />
        </main>
      </div>
    </div>
  )
}
