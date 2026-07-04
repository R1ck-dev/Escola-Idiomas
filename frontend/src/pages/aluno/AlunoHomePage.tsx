import { Link } from 'react-router-dom'
import { BookOpen, CaretRight, ChartBar, CheckCircle, Clock, Confetti, Wallet, XCircle } from '@phosphor-icons/react'
import { useAuth } from '@/auth/AuthContext'
import { useMeuBoletim, useMinhasMensalidades, useMinhasTurmasAluno } from '@/api/aluno'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/states'
import { competenciaAtual, formatBRL, formatCompetencia, formatDate, formatHora } from '@/lib/format'
import { situacaoAprovacao, statusMensalidade } from '@/lib/status'
import type { Boletim, SituacaoAprovacao, Turma } from '@/types/api'

const AMBER = '#F5B70A'

/** Média com vírgula decimal, ex.: 81.5 → "81,5". */
function formatNota(n: number | null): string {
  if (n == null) return '—'
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ',')
}

/** "19:00:00"–"20:30:00" → "19:00–20:30". */
function faixaHorario(t: Turma): string {
  const ini = formatHora(t.horaInicio)
  const fim = formatHora(t.horaFim)
  if (ini && fim) return `${ini}–${fim}`
  return ini || ''
}

/** Frase encorajadora derivada da média/situação (regra do front). */
function mensagemDesempenho(b: Boletim): string {
  if (b.media == null) return 'Suas notas aparecem aqui assim que forem lançadas.'
  if (b.situacao === 'APROVADO') return 'Você está indo muito bem. Continue assim!'
  if (b.situacao === 'REPROVADO') return 'Não desanime — fale com seu professor e siga em frente.'
  return b.media >= 70 ? 'Você está indo bem, continue assim!' : 'Vamos com tudo neste semestre!'
}

function iconSituacao(s: SituacaoAprovacao) {
  if (s === 'APROVADO') return <CheckCircle weight="fill" />
  if (s === 'REPROVADO') return <XCircle weight="fill" />
  return <Clock weight="fill" />
}

/** Card hero (navy escuro) — mensalidade do mês em destaque. */
function MensalidadeHeroCard() {
  const { data, isLoading, isError, refetch } = useMinhasMensalidades()

  if (isLoading) return <Skeleton className="h-44 w-full rounded-2xl" />
  if (isError) {
    return <ErrorState title="Não foi possível carregar sua mensalidade" onRetry={() => refetch()} />
  }

  const lista = data ?? []
  const comp = competenciaAtual()
  const doMes = lista.find((m) => m.competencia === comp)
  const maisAtrasada = lista.filter((m) => m.situacao === 'ATRASADA').sort((a, b) => b.diasAtraso - a.diasAtraso)[0]
  const emAberto = lista.find((m) => m.situacao === 'ABERTA')
  const m = doMes ?? maisAtrasada ?? emAberto
  const emDia = !m || m.situacao === 'PAGA' || m.situacao === 'CANCELADA'

  const wrap =
    'block rounded-2xl bg-navy-950 p-6 text-white shadow-[0_8px_24px_rgba(12,42,77,.18)] transition hover:shadow-[0_12px_30px_rgba(12,42,77,.28)]'

  if (emDia || !m) {
    return (
      <Link to="/aluno/financeiro" className={wrap} aria-label="Ver minhas mensalidades">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-navy-300">Mensalidades</span>
          <Wallet size={22} weight="fill" style={{ color: AMBER }} />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10">
            <Confetti size={24} className="text-[#43D889]" />
          </div>
          <div>
            <p className="text-lg font-bold">Você está em dia!</p>
            <p className="text-sm text-navy-300">Nenhuma mensalidade em aberto. 🎉</p>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-1 text-sm font-semibold" style={{ color: AMBER }}>
          Ver mensalidades <CaretRight size={16} weight="bold" />
        </div>
      </Link>
    )
  }

  const info = statusMensalidade[m.situacao]
  const atrasada = m.situacao === 'ATRASADA'
  const valor = atrasada ? m.valorAtualizado : m.valorEfetivo

  return (
    <Link to="/aluno/financeiro" className={wrap} aria-label="Ver minhas mensalidades">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-navy-300">Mensalidade de {formatCompetencia(m.competencia)}</span>
        <Wallet size={22} weight="fill" style={{ color: AMBER }} />
      </div>

      <div className="mt-3">
        <Badge tone={info.tone}>{info.label}</Badge>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-x-2 gap-y-1">
        <span className="tabular text-[34px] font-extrabold leading-none tracking-[-.02em]">{formatBRL(valor)}</span>
        {atrasada && <span className="pb-1 text-sm text-navy-300">com multa e juros</span>}
      </div>

      {atrasada ? (
        <p className="mt-2 text-sm text-navy-300">
          Valor original {formatBRL(m.valorBase)} · venceu há {m.diasAtraso} {m.diasAtraso === 1 ? 'dia' : 'dias'}
        </p>
      ) : (
        <p className="mt-2 text-sm text-navy-300">Vence em {formatDate(m.vencimento)}</p>
      )}

      {atrasada && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-white/10 p-3.5 text-sm text-white/90">
          <Clock size={18} weight="fill" className="mt-0.5 shrink-0" style={{ color: AMBER }} />
          <span>Passe na secretaria para regularizar — o pagamento é registrado por lá.</span>
        </div>
      )}

      <div className="mt-5 flex items-center gap-1 text-sm font-semibold" style={{ color: AMBER }}>
        Ver mensalidades <CaretRight size={16} weight="bold" />
      </div>
    </Link>
  )
}

const tileWrap =
  'group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(16,24,40,.04)] transition hover:border-line-strong'

/** Tile "Minhas turmas". */
function TurmasResumoCard() {
  const { data, isLoading, isError, refetch } = useMinhasTurmasAluno()

  if (isLoading) return <Skeleton className="h-44 w-full rounded-2xl" />
  if (isError) {
    return <ErrorState title="Não foi possível carregar suas turmas" onRetry={() => refetch()} />
  }

  const turmas = data ?? []
  const n = turmas.length
  const primeira = turmas[0]

  return (
    <Link to="/aluno/turmas" className={tileWrap} aria-label="Ver minhas turmas">
      <div className="flex items-center justify-between">
        <div className="grid size-10 place-items-center rounded-xl bg-navy-50 text-brand">
          <BookOpen size={20} weight="fill" />
        </div>
        <CaretRight size={18} weight="bold" className="text-ink-subtle transition group-hover:text-brand" />
      </div>

      <h2 className="mt-4 text-lg font-bold text-ink">Minhas turmas</h2>

      {n === 0 ? (
        <p className="mt-1 text-sm text-ink-muted">Você ainda não está em nenhuma turma.</p>
      ) : (
        <>
          <p className="mt-1 text-sm text-ink-muted">{n === 1 ? '1 turma ativa' : `${n} turmas ativas`}</p>
          {primeira && (
            <div className="mt-3 rounded-xl bg-canvas p-3">
              <p className="text-sm font-semibold text-ink">{primeira.nome}</p>
              <p className="mt-0.5 text-[13px] text-ink-muted">
                {[primeira.diasSemana, faixaHorario(primeira)].filter(Boolean).join(' · ') || 'Horário a confirmar'}
              </p>
            </div>
          )}
        </>
      )}

      <span className="mt-auto pt-4 text-sm font-semibold text-brand">Ver turmas</span>
    </Link>
  )
}

/** Tile "Meu desempenho". */
function DesempenhoCard() {
  const { data, isLoading, isError, refetch } = useMeuBoletim()

  if (isLoading) return <Skeleton className="h-44 w-full rounded-2xl" />
  if (isError) {
    return <ErrorState title="Não foi possível carregar seu desempenho" onRetry={() => refetch()} />
  }

  const b = (data ?? [])[0]
  const sit = b ? situacaoAprovacao[b.situacao] : null

  return (
    <Link to="/aluno/boletim" className={tileWrap} aria-label="Ver meu boletim">
      <div className="flex items-center justify-between">
        <div className="grid size-10 place-items-center rounded-xl bg-navy-50 text-brand">
          <ChartBar size={20} weight="fill" />
        </div>
        <CaretRight size={18} weight="bold" className="text-ink-subtle transition group-hover:text-brand" />
      </div>

      <h2 className="mt-4 text-lg font-bold text-ink">Meu desempenho</h2>

      {!b || !sit ? (
        <p className="mt-1 text-sm text-ink-muted">Suas notas aparecem aqui assim que forem lançadas.</p>
      ) : (
        <>
          <p className="mt-1 text-sm text-ink-muted">{mensagemDesempenho(b)}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex items-baseline gap-1">
              <span className="tabular text-[28px] font-extrabold leading-none tracking-[-.02em] text-brand">
                {formatNota(b.media)}
              </span>
              <span className="text-[13px] text-ink-muted">média</span>
            </div>
            <Badge tone={sit.tone} icon={iconSituacao(b.situacao)}>
              {sit.label}
            </Badge>
          </div>
        </>
      )}

      <span className="mt-auto pt-4 text-sm font-semibold text-brand">Ver boletim</span>
    </Link>
  )
}

export default function AlunoHomePage() {
  const { user } = useAuth()
  const primeiroNome = user?.nome?.trim().split(/\s+/)[0] || 'aluno'

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-5 pb-4">
      <header className="pt-1">
        <h1 className="text-[26px] font-extrabold leading-tight tracking-[-.015em] text-ink">Olá, {primeiroNome}!</h1>
        <p className="mt-1 text-[15px] text-ink-muted">Que bom ter você por aqui.</p>
      </header>

      <MensalidadeHeroCard />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TurmasResumoCard />
        <DesempenhoCard />
      </div>
    </div>
  )
}
