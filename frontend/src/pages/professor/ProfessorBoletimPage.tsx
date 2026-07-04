import { CaretRight, CheckCircle, Clock, Exam, XCircle } from '@phosphor-icons/react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPercent } from '@/lib/format'
import { situacaoAprovacao, tipoAvaliacaoLabel } from '@/lib/status'
import { useBoletim } from '@/api/professor'
import type { SituacaoAprovacao } from '@/types/api'

const LIMITE_FALTAS = 25

const situacaoVisual: Record<
  SituacaoAprovacao,
  { Icon: typeof CheckCircle; wrap: string; text: string; icon: string }
> = {
  APROVADO: {
    Icon: CheckCircle,
    wrap: 'bg-success-bg',
    text: 'text-success-dark',
    icon: 'text-success',
  },
  REPROVADO: {
    Icon: XCircle,
    wrap: 'bg-danger-bg',
    text: 'text-danger-dark',
    icon: 'text-danger',
  },
  EM_ANDAMENTO: {
    Icon: Clock,
    wrap: 'bg-warning-bg',
    text: 'text-warning-fg',
    icon: 'text-warning',
  },
}

function formatNota(nota: number | null): string {
  if (nota === null) return '—'
  return nota.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
}

function BackLink() {
  return (
    <Link
      to="/professor"
      className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
    >
      <CaretRight size={16} weight="bold" className="rotate-180" />
      Minhas turmas
    </Link>
  )
}

function NotaCard({
  rotulo,
  valor,
  destaque,
  valueClassName,
}: {
  rotulo: string
  valor: string
  destaque?: boolean
  valueClassName?: string
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-[0_1px_2px_rgba(16,24,40,.04)] ${
        destaque ? 'border-brand/30 bg-navy-50' : 'border-line bg-surface'
      }`}
    >
      <p className="text-[13px] font-medium text-ink-muted">{rotulo}</p>
      <p
        className={`tabular mt-2 font-extrabold tracking-tight ${
          destaque ? 'text-3xl' : 'text-2xl'
        } ${valueClassName ?? (destaque ? 'text-brand' : 'text-ink')}`}
      >
        {valor}
      </p>
    </div>
  )
}

export default function ProfessorBoletimPage() {
  const { matriculaId } = useParams()
  const { data: boletim, isLoading, isError, refetch } = useBoletim(matriculaId)

  return (
    <div className="mx-auto w-full max-w-[720px]">
      <header className="mb-6">
        <BackLink />
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink sm:text-[26px]">
          {boletim?.alunoNome ?? 'Boletim do aluno'}
        </h1>
        {boletim && (
          <p className="mt-1 text-[15px] text-ink-muted">
            {boletim.turmaNome ?? 'Turma'} · {boletim.semestreReferencia}
          </p>
        )}
      </header>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Não foi possível carregar o boletim"
          description="Tente novamente em instantes."
          onRetry={() => refetch()}
        />
      ) : !boletim ? (
        <EmptyState
          icon={<Exam size={30} className="text-brand" />}
          title="Boletim indisponível"
          description="Ainda não há um boletim para esta matrícula neste semestre."
          tintClass="bg-navy-50"
        />
      ) : (
        (() => {
          const sit = situacaoAprovacao[boletim.situacao]
          const visual = situacaoVisual[boletim.situacao]
          const { Icon } = visual
          const pf = boletim.percentualFaltas
          const faltasClass =
            pf > LIMITE_FALTAS
              ? 'text-danger-dark'
              : pf === LIMITE_FALTAS
                ? 'text-[#b8860b]'
                : 'text-ink-muted'

          return (
            <div className="space-y-4">
              {/* Situação — destaque grande */}
              <div
                className={`flex flex-col items-start gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:gap-5 ${visual.wrap}`}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface/70">
                  <Icon size={34} weight="fill" className={visual.icon} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-[13px] font-semibold ${visual.text}`}>
                    Situação no semestre
                  </p>
                  <p className={`text-2xl font-extrabold tracking-tight ${visual.text}`}>
                    {sit.label}
                  </p>
                </div>
                <Badge tone={sit.tone} icon={<Icon size={14} weight="fill" />}>
                  {sit.label}
                </Badge>
              </div>

              {/* Notas e frequência */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <NotaCard
                  rotulo={tipoAvaliacaoLabel.MIDTERM}
                  valor={formatNota(boletim.notaMidterm)}
                />
                <NotaCard
                  rotulo={tipoAvaliacaoLabel.FINAL}
                  valor={formatNota(boletim.notaFinal)}
                />
                <NotaCard
                  rotulo="Média"
                  valor={formatNota(boletim.media)}
                  destaque
                  valueClassName={
                    boletim.media === null
                      ? 'text-ink-subtle'
                      : boletim.media >= 70
                        ? 'text-success-dark'
                        : 'text-danger-dark'
                  }
                />
                <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(16,24,40,.04)]">
                  <p className="text-[13px] font-medium text-ink-muted">Faltas</p>
                  <p className="tabular mt-2 text-2xl font-extrabold tracking-tight text-ink">
                    {boletim.faltas}
                    <span className="text-base font-semibold text-ink-subtle">
                      /{boletim.totalAulas}
                    </span>
                  </p>
                  <p className={`tabular mt-1 text-[13px] font-semibold ${faltasClass}`}>
                    {formatPercent(boletim.percentualFaltas)} de faltas
                  </p>
                </div>
              </div>

              {/* Regra amigável */}
              <div className="rounded-2xl border border-info-border bg-navy-50 p-5">
                <p className="text-[15px] font-semibold text-brand">Como funciona a aprovação</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                  Para ser <strong className="text-ink">aprovado</strong>, o aluno precisa de{' '}
                  <strong className="text-ink">média igual ou maior que 70</strong> e no máximo{' '}
                  <strong className="text-ink">25% de faltas</strong>. Enquanto as duas notas não
                  forem lançadas, a situação fica como <em>Em andamento</em>.
                </p>
              </div>
            </div>
          )
        })()
      )}
    </div>
  )
}
