import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  CaretRight,
  CheckCircle,
  ClipboardText,
  Clock,
  CurrencyDollar,
  Users,
  Wallet,
  Warning,
} from '@phosphor-icons/react'
import { useDashboard, useMatriculas, useMensalidades } from '@/api/gestao'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/states'
import { competenciaAtual, formatBRL, formatCompetencia, formatDate } from '@/lib/format'
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

// ---------------------------------------------------------------------------
// Seção "Precisa da sua atenção" — itens acionáveis (matrículas + mensalidades)
// ---------------------------------------------------------------------------

/** yyyy-MM-dd no fuso local (sem deslocamento do toISOString). */
function dataLocalISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

type AtencaoTone = 'warning' | 'danger' | 'info'

const chipTint: Record<AtencaoTone, string> = {
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
  info: 'bg-info-bg text-info',
}

/** Uma linha: nome do aluno (forte) + subtítulo à esquerda, valor/meta à direita. */
function LinhaAtencao({
  nome,
  sub,
  subTone,
  direita,
  direitaClass,
}: {
  nome: string
  sub: string
  subTone?: 'muted' | 'danger'
  direita: string
  direitaClass: string
}) {
  return (
    <li className="flex items-center justify-between gap-3 border-t border-line py-2 first:border-t-0 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <div className="truncate text-[14px] font-semibold text-ink">{nome}</div>
        <div
          className={cn(
            'truncate text-[12.5px]',
            subTone === 'danger' ? 'font-medium text-danger-dark' : 'text-ink-muted',
          )}
        >
          {sub}
        </div>
      </div>
      <span className={cn('shrink-0 tabular', direitaClass)}>{direita}</span>
    </li>
  )
}

/** Card de um grupo acionável: cabeçalho + até 3 linhas + "e mais N" + link. */
function GrupoAtencao({
  icon,
  tone,
  titulo,
  total,
  mostrados,
  unidade,
  to,
  cta,
  children,
}: {
  icon: ReactNode
  tone: AtencaoTone
  titulo: string
  total: number
  mostrados: number
  unidade: [string, string]
  to: string
  cta: string
  children: ReactNode
}) {
  const restante = total - mostrados
  return (
    <Card className="flex min-w-0 flex-1 flex-col p-5">
      <div className="flex items-center gap-2.5">
        <div className={cn('grid size-9 shrink-0 place-items-center rounded-xl', chipTint[tone])}>{icon}</div>
        <h3 className="min-w-0 flex-1 truncate text-[15px] font-semibold text-ink">{titulo}</h3>
        <Badge tone={tone}>{total}</Badge>
      </div>
      <ul className="mt-3">{children}</ul>
      {restante > 0 && (
        <p className="mt-2.5 text-[12.5px] text-ink-muted">
          e mais {restante} {restante === 1 ? unidade[0] : unidade[1]}
        </p>
      )}
      <Link
        to={to}
        className="group mt-3.5 inline-flex items-center gap-1 self-start text-[13px] font-semibold text-brand"
      >
        {cta}
        <CaretRight size={14} weight="bold" className="transition group-hover:translate-x-0.5" />
      </Link>
    </Card>
  )
}

/** Título da seção reutilizado no estado carregado e no "tudo em dia". */
function AtencaoHeading() {
  return <h2 className="text-base font-bold tracking-[-.01em] text-ink">Precisa da sua atenção</h2>
}

/** Consulta matrículas aguardando + mensalidades da competência e destaca o acionável. */
function AtencaoSection({ competencia }: { competencia: string }) {
  const matriculas = useMatriculas('AGUARDANDO_APROVACAO')
  const mensalidades = useMensalidades(competencia)

  if (matriculas.isLoading || mensalidades.isLoading) {
    return (
      <section className="flex flex-col gap-4">
        <Skeleton className="h-6 w-44 rounded" />
        <div className="flex flex-col gap-4 lg:flex-row">
          <Skeleton className="h-[172px] w-full rounded-2xl lg:flex-1" />
          <Skeleton className="h-[172px] w-full rounded-2xl lg:flex-1" />
        </div>
      </section>
    )
  }

  const aguardando = [...(matriculas.data ?? [])].sort((a, b) => a.dataMatricula.localeCompare(b.dataMatricula))

  const mens = mensalidades.data ?? []
  const atrasadas = mens.filter((m) => m.situacao === 'ATRASADA').sort((a, b) => b.diasAtraso - a.diasAtraso)

  // "Vencendo esta semana": em aberto com vencimento entre hoje e +7 dias (compara strings yyyy-MM-dd).
  const hoje = new Date()
  const limite = new Date(hoje)
  limite.setDate(limite.getDate() + 7)
  const hojeStr = dataLocalISO(hoje)
  const limiteStr = dataLocalISO(limite)
  const vencendo = mens
    .filter((m) => m.situacao === 'ABERTA' && m.vencimento >= hojeStr && m.vencimento <= limiteStr)
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento))

  const temAlgo = aguardando.length > 0 || atrasadas.length > 0 || vencendo.length > 0

  if (!temAlgo) {
    // Se ambas as consultas falharam e não há dados, não afirme "tudo em dia".
    if (matriculas.isError && mensalidades.isError) return null
    return (
      <section className="flex flex-col gap-4">
        <AtencaoHeading />
        <Card className="flex items-center gap-3 p-5">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-success-bg text-success">
            <CheckCircle size={18} weight="fill" />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-ink">Tudo em dia</div>
            <p className="text-[12.5px] text-ink-muted">Sem matrículas aguardando ou mensalidades atrasadas.</p>
          </div>
        </Card>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-4">
      <AtencaoHeading />
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap">
        {aguardando.length > 0 && (
          <GrupoAtencao
            icon={<ClipboardText size={18} weight="fill" />}
            tone="warning"
            titulo="Matrículas aguardando"
            total={aguardando.length}
            mostrados={Math.min(aguardando.length, 3)}
            unidade={['solicitação', 'solicitações']}
            to="/gestao/matriculas"
            cta="Revisar solicitações"
          >
            {aguardando.slice(0, 3).map((m) => (
              <LinhaAtencao
                key={m.id}
                nome={m.alunoNome ?? 'Aluno'}
                sub={m.turmaNome ?? '—'}
                direita={formatDate(m.dataMatricula)}
                direitaClass="text-[12.5px] text-ink-subtle"
              />
            ))}
          </GrupoAtencao>
        )}

        {atrasadas.length > 0 && (
          <GrupoAtencao
            icon={<Warning size={18} weight="fill" />}
            tone="danger"
            titulo="Mensalidades atrasadas"
            total={atrasadas.length}
            mostrados={Math.min(atrasadas.length, 3)}
            unidade={['mensalidade', 'mensalidades']}
            to="/gestao/financeiro"
            cta="Ver no financeiro"
          >
            {atrasadas.slice(0, 3).map((m) => (
              <LinhaAtencao
                key={m.id}
                nome={m.alunoNome ?? 'Aluno'}
                sub={`${m.diasAtraso} ${m.diasAtraso === 1 ? 'dia' : 'dias'} em atraso`}
                subTone="danger"
                direita={formatBRL(m.valorAtualizado)}
                direitaClass="text-[14px] font-bold text-danger-dark"
              />
            ))}
          </GrupoAtencao>
        )}

        {vencendo.length > 0 && (
          <GrupoAtencao
            icon={<Clock size={18} weight="fill" />}
            tone="info"
            titulo="Vencendo esta semana"
            total={vencendo.length}
            mostrados={Math.min(vencendo.length, 3)}
            unidade={['mensalidade', 'mensalidades']}
            to="/gestao/financeiro"
            cta="Ver no financeiro"
          >
            {vencendo.slice(0, 3).map((m) => (
              <LinhaAtencao
                key={m.id}
                nome={m.alunoNome ?? 'Aluno'}
                sub={`vence ${formatDate(m.vencimento)}`}
                direita={formatBRL(m.valorEfetivo)}
                direitaClass="text-[14px] font-semibold text-ink"
              />
            ))}
          </GrupoAtencao>
        )}
      </div>
    </section>
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
      ) : (
        <>
          {isLoading || !data ? <ResumoCarregando /> : <ResumoCarregado d={data} />}
          <AtencaoSection competencia={competencia} />
        </>
      )}
    </div>
  )
}
