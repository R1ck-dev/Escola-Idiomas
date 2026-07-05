import { type ReactNode, type RefObject, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  Bell,
  Books,
  CalendarBlank,
  CaretRight,
  ChalkboardTeacher,
  CheckCircle,
  ClipboardText,
  House,
  List,
  MagnifyingGlass,
  SignOut,
  Wallet,
  Warning,
  X,
} from '@phosphor-icons/react'
import { Logo } from '@/components/Logo'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/auth/AuthContext'
import { useBuscarAlunos, useDashboard, useMatriculas, useMensalidades } from '@/api/gestao'
import { competenciaAtual } from '@/lib/format'
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

// ---------------------------------------------------------------------------
// Cabeçalho: busca de aluno + sino de notificações
// ---------------------------------------------------------------------------

/** Valor com atraso de `delay`ms — debounce simples para a busca. */
function useDebounced<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

/** Fecha ao clicar fora do `ref` ou apertar ESC (ativo só enquanto `ativo`). */
function useDismiss<T extends HTMLElement>(ref: RefObject<T | null>, onClose: () => void, ativo: boolean) {
  useEffect(() => {
    if (!ativo) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [ref, onClose, ativo])
}

/** Painel flutuante ancorado ao gatilho — reusa o Card com sombra elevada. */
function Dropdown({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <Card className={cn('absolute top-full z-40 mt-2 overflow-hidden shadow-[0_16px_40px_rgba(12,42,77,.16)]', className)}>
      {children}
    </Card>
  )
}

/**
 * Busca de aluno do cabeçalho: input com debounce + dropdown que apenas LISTA os
 * alunos encontrados (nome/e-mail). Não há tela de detalhe para onde navegar.
 */
function BuscaAlunos() {
  const [termo, setTermo] = useState('')
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const q = useDebounced(termo, 250).trim()
  const { data, isFetching } = useBuscarAlunos(q)

  useDismiss(ref, () => setAberto(false), aberto)

  const resultados = data ?? []
  const mostra = aberto && q.length >= 2

  return (
    <div ref={ref} className="relative w-full max-w-sm">
      <MagnifyingGlass
        size={18}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle"
      />
      <Input
        value={termo}
        onChange={(e) => {
          setTermo(e.target.value)
          setAberto(true)
        }}
        onFocus={() => setAberto(true)}
        placeholder="Buscar aluno…"
        aria-label="Buscar aluno"
        className="h-11 pl-10"
      />
      {mostra && (
        <Dropdown className="inset-x-0">
          {isFetching && resultados.length === 0 ? (
            <div className="flex items-center gap-2 px-4 py-4 text-[13px] text-ink-muted">
              <Spinner />
              Buscando…
            </div>
          ) : resultados.length === 0 ? (
            <div className="px-4 py-4 text-[13px] text-ink-muted">Nenhum aluno encontrado</div>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1.5">
              {resultados.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-3 py-2">
                  <Avatar nome={a.nome} tint className="size-8 text-[12px]" />
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-medium text-ink">{a.nome}</div>
                    <div className="truncate text-[12.5px] text-ink-muted">{a.email}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Dropdown>
      )}
    </div>
  )
}

const notifTint = {
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
} as const

/** Uma linha do sino: grupo + contagem, linkando para a página correspondente. */
function NotifItem({
  to,
  icon,
  tone,
  label,
  count,
  onNavigate,
}: {
  to: string
  icon: ReactNode
  tone: 'warning' | 'danger'
  label: string
  count: number
  onNavigate: () => void
}) {
  return (
    <li>
      <Link
        to={to}
        onClick={onNavigate}
        className="group flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition hover:bg-canvas"
      >
        <div className={cn('grid size-9 shrink-0 place-items-center rounded-xl', notifTint[tone])}>{icon}</div>
        <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink">{label}</span>
        <Badge tone={count > 0 ? tone : 'neutral'}>{count}</Badge>
        <CaretRight size={14} weight="bold" className="shrink-0 text-ink-subtle transition group-hover:text-brand" />
      </Link>
    </li>
  )
}

/** Sino com badge = matrículas aguardando + mensalidades atrasadas (competência atual). */
function SinoNotificacoes() {
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useDismiss(ref, () => setAberto(false), aberto)

  const { data: matriculas } = useMatriculas({ status: 'AGUARDANDO_APROVACAO', size: 3 })
  const { data: mensalidades } = useMensalidades({
    competencia: competenciaAtual(),
    situacao: 'ATRASADA',
    size: 3,
  })

  // Contagens do sino vêm do agregado do servidor (totalElements), não do tamanho da página.
  const aguardando = matriculas?.totalElements ?? 0
  const atrasadas = mensalidades?.totalElements ?? 0
  const total = aguardando + atrasadas

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-label={total > 0 ? `Notificações (${total})` : 'Notificações'}
        className="relative grid size-10 place-items-center rounded-full text-ink-muted transition hover:bg-canvas hover:text-ink"
      >
        <Bell size={22} weight={aberto ? 'fill' : 'regular'} />
        {total > 0 && (
          <span className="absolute right-1 top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[11px] font-bold tabular text-ink">
            {total}
          </span>
        )}
      </button>
      {aberto && (
        <Dropdown className="right-0 w-[300px]">
          <div className="border-b border-line px-4 py-3">
            <h3 className="text-[14px] font-bold text-ink">Notificações</h3>
          </div>
          {total === 0 ? (
            <div className="flex items-center gap-3 px-4 py-5">
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-success-bg text-success">
                <CheckCircle size={18} weight="fill" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-ink">Tudo em dia</div>
                <p className="text-[12.5px] text-ink-muted">Sem matrículas ou mensalidades pendentes.</p>
              </div>
            </div>
          ) : (
            <ul className="p-1.5">
              <NotifItem
                to="/gestao/matriculas"
                icon={<ClipboardText size={18} weight="fill" />}
                tone="warning"
                label="Matrículas aguardando"
                count={aguardando}
                onNavigate={() => setAberto(false)}
              />
              <NotifItem
                to="/gestao/financeiro"
                icon={<Warning size={18} weight="fill" />}
                tone="danger"
                label="Mensalidades atrasadas"
                count={atrasadas}
                onNavigate={() => setAberto(false)}
              />
            </ul>
          )}
        </Dropdown>
      )}
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
        {/* Cabeçalho desktop: busca de aluno + sino */}
        <header className="sticky top-0 z-30 hidden items-center gap-4 border-b border-line bg-surface px-8 py-3 md:flex">
          <BuscaAlunos />
          <div className="ml-auto">
            <SinoNotificacoes />
          </div>
        </header>

        {/* Cabeçalho mobile: menu + logo + (sino + sair) */}
        <header className="flex items-center justify-between border-b border-line bg-surface px-5 py-3 md:hidden">
          <button onClick={() => setDrawer(true)} aria-label="Abrir menu" className="text-ink-muted">
            <List size={24} />
          </button>
          <Logo size="sm" />
          <div className="flex items-center gap-0.5">
            <SinoNotificacoes />
            <button onClick={logout} aria-label="Sair" className="grid size-10 place-items-center text-ink-muted">
              <SignOut size={20} />
            </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
