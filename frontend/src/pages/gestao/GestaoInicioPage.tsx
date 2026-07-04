import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CaretRight, ClipboardText, Clock, CurrencyDollar, Users, Wallet, Warning } from '@phosphor-icons/react'
import { useDashboard } from '@/api/gestao'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/states'
import { competenciaAtual, formatBRL, formatCompetencia } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Dashboard } from '@/types/api'

type StatTone = 'success' | 'info' | 'danger' | 'warning'

const TONE: Record<StatTone, { tint: string; value: string }> = {
  success: { tint: 'bg-success-bg text-success', value: 'text-success' },
  info: { tint: 'bg-info-bg text-info', value: 'text-info' },
  danger: { tint: 'bg-danger-bg text-danger', value: 'text-danger' },
  warning: { tint: 'bg-warning-bg text-warning', value: 'text-warning' },
}

/** Card de destaque: rótulo + valor grande tabular + ícone tonalizado. */
function StatCard({
  label,
  value,
  unit,
  icon,
  tone,
}: {
  label: string
  value: string
  unit?: string
  icon: ReactNode
  tone: StatTone
}) {
  const t = TONE[tone]
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-medium text-ink-muted">{label}</span>
        <div className={cn('grid size-9 shrink-0 place-items-center rounded-xl', t.tint)}>{icon}</div>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={cn('tabular text-[26px] font-extrabold leading-none tracking-[-.02em]', t.value)}>{value}</span>
        {unit && <span className="text-[13px] font-medium text-ink-muted">{unit}</span>}
      </div>
    </Card>
  )
}

const shortcutClass =
  'group flex items-start gap-4 rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(16,24,40,.04)] transition hover:border-line-strong hover:shadow-[0_2px_8px_rgba(16,24,40,.06)]'

/** Conteúdo carregado: 4 cards de destaque + 2 atalhos. */
function ResumoCarregado({ d }: { d: Dashboard }) {
  const pendentes = d.solicitacoesPendentes
  const total = d.totalMensalidades
  const progresso = total > 0 ? Math.round((d.pagas / total) * 100) : 0

  return (
    <>
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Recebido"
          value={formatBRL(d.recebido)}
          tone="success"
          icon={<CurrencyDollar size={18} weight="fill" />}
        />
        <StatCard label="Em aberto" value={formatBRL(d.emAberto)} tone="info" icon={<Clock size={18} weight="fill" />} />
        <StatCard label="Em atraso" value={formatBRL(d.emAtraso)} tone="danger" icon={<Warning size={18} weight="fill" />} />
        <StatCard
          label="Inadimplentes"
          value={String(d.inadimplentes)}
          unit={d.inadimplentes === 1 ? 'aluno' : 'alunos'}
          tone="warning"
          icon={<Users size={18} weight="fill" />}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link to="/gestao/matriculas" className={shortcutClass} aria-label="Ver solicitações de matrícula pendentes">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy-50 text-brand">
            <ClipboardText size={22} weight="fill" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold text-ink">Solicitações pendentes</h2>
              {pendentes > 0 && <Badge tone="warning">{pendentes}</Badge>}
            </div>
            <p className="mt-0.5 text-[13px] text-ink-muted">
              {pendentes > 0
                ? `${pendentes} ${pendentes === 1 ? 'matrícula aguardando' : 'matrículas aguardando'} aprovação`
                : 'Nenhuma solicitação no momento.'}
            </p>
          </div>
          <CaretRight size={18} weight="bold" className="shrink-0 text-ink-subtle transition group-hover:text-brand" />
        </Link>

        <Link to="/gestao/financeiro" className={shortcutClass} aria-label="Abrir painel financeiro">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy-50 text-brand">
            <Wallet size={22} weight="fill" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-semibold text-ink">Painel financeiro</h2>
            <p className="mt-0.5 text-[13px] text-ink-muted">
              {total > 0
                ? `${d.pagas} de ${total} ${total === 1 ? 'mensalidade paga' : 'mensalidades pagas'}`
                : 'Nenhuma mensalidade neste mês.'}
            </p>
            {total > 0 && (
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-navy-50">
                <div className="h-full rounded-full bg-accent" style={{ width: `${progresso}%` }} />
              </div>
            )}
          </div>
          <CaretRight size={18} weight="bold" className="shrink-0 text-ink-subtle transition group-hover:text-brand" />
        </Link>
      </section>
    </>
  )
}

/** Skeletons no lugar dos cards enquanto carrega. */
function ResumoCarregando() {
  return (
    <>
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[92px] w-full rounded-2xl" />
        ))}
      </section>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] w-full rounded-2xl" />
        ))}
      </section>
    </>
  )
}

export default function GestaoInicioPage() {
  const { data, isLoading, isError, refetch } = useDashboard()
  const competencia = data?.competencia ?? competenciaAtual()

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-[26px] font-extrabold tracking-[-.015em] text-ink">Início</h1>
        <p className="mt-1 text-[15px] text-ink-muted">Visão geral de {formatCompetencia(competencia)}</p>
      </header>

      {isError ? (
        <ErrorState
          title="Não foi possível carregar o resumo do mês"
          description="Tente novamente em instantes."
          onRetry={() => refetch()}
        />
      ) : isLoading || !data ? (
        <ResumoCarregando />
      ) : (
        <ResumoCarregado d={data} />
      )}
    </div>
  )
}
