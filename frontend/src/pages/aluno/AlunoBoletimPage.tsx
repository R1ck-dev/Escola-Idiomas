import { useMemo, useState, type ReactNode } from 'react'
import { CaretDown, CheckCircle, ChartBar, Clock, Exam, MinusCircle, XCircle } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState, ErrorState, LoadingRows } from '@/components/ui/states'
import { formatPercent } from '@/lib/format'
import { situacaoAprovacao, tipoAvaliacaoLabel } from '@/lib/status'
import { useMeuBoletim, useMinhaFrequencia, useSemestres } from '@/api/aluno'
import type { AulaFrequencia, Boletim, SituacaoAprovacao } from '@/types/api'

/** Limite de faltas (regra de negócio): acima disso o aluno reprova por frequência. */
const LIMITE_FALTAS = 25

const situacaoIcon: Record<SituacaoAprovacao, ReactNode> = {
  APROVADO: <CheckCircle size={18} weight="fill" />,
  REPROVADO: <XCircle size={18} weight="fill" />,
  EM_ANDAMENTO: <Clock size={18} weight="fill" />,
}

const situacaoFrase: Record<SituacaoAprovacao, string> = {
  APROVADO: 'Você foi aprovado! Parabéns pelo semestre.',
  REPROVADO: 'Atenção às faltas — vale conversar com a escola.',
  EM_ANDAMENTO: 'Ainda em andamento. As notas continuam sendo lançadas.',
}

/** 81.5 → "81,5"; null → "—". */
function formatNota(n: number | null): string {
  if (n == null) return '—'
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
}

/** "2026-2" → "2º semestre de 2026". */
function formatSemestre(ref: string | null): string {
  if (!ref) return ''
  const m = ref.match(/^(\d{4})-(\d)$/)
  if (!m) return ref
  return `${m[2]}º semestre de ${m[1]}`
}

/** "2026-07-05" → "05/07 · sáb". */
function formatDataAula(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  const dia = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  const semana = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
  return `${dia} · ${semana}`
}

const presencaVisual = {
  presente: { icon: <CheckCircle size={18} weight="fill" className="text-success" />, label: 'Presente' },
  falta: { icon: <XCircle size={18} weight="fill" className="text-danger" />, label: 'Falta' },
  semRegistro: { icon: <MinusCircle size={18} className="text-ink-subtle" />, label: 'Sem registro' },
} as const

function AulaLinha({ aula }: { aula: AulaFrequencia }) {
  const v = aula.presente == null ? presencaVisual.semRegistro : aula.presente ? presencaVisual.presente : presencaVisual.falta
  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <span className="text-[13px] font-medium text-ink tabular">{formatDataAula(aula.data)}</span>
      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted">
        {v.icon}
        {v.label}
      </span>
    </li>
  )
}

function NotaTile({ label, nota }: { label: string; nota: number | null }) {
  return (
    <div className="rounded-xl border border-line bg-surface-2 p-4">
      <div className="flex items-center gap-2 text-ink-muted">
        <Exam size={18} />
        <span className="text-[13px] font-semibold">{label}</span>
      </div>
      {nota == null ? (
        <p className="mt-2 text-[15px] font-medium text-ink-subtle">Ainda não lançada</p>
      ) : (
        <p className="mt-1 text-3xl font-extrabold tracking-tight text-ink tabular">
          {formatNota(nota)}
        </p>
      )}
    </div>
  )
}

function FrequenciaCard({ boletim, aulas }: { boletim: Boletim; aulas?: AulaFrequencia[] }) {
  const { faltas, totalAulas, percentualFaltas } = boletim
  // RN-33/34: exatamente 25% ainda aprova (backend usa <=); a UI acompanha o mesmo limite.
  const dentroLimite = percentualFaltas <= LIMITE_FALTAS
  const preenchido = Math.min(Math.max(percentualFaltas, 0), 100)
  const [aberto, setAberto] = useState(false)
  const temAulas = aulas != null && aulas.length > 0

  return (
    <div className="rounded-xl border border-line bg-surface-2 p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[15px] font-bold text-ink">Frequência</h3>
        <span className="text-[13px] font-medium text-ink-muted tabular">
          {faltas} {faltas === 1 ? 'falta' : 'faltas'} de {totalAulas} aulas
        </span>
      </div>

      <div className="relative mt-3 h-3 w-full overflow-hidden rounded-full bg-line">
        <div
          className={`h-full rounded-full ${dentroLimite ? 'bg-success' : 'bg-danger'}`}
          style={{ width: `${preenchido}%` }}
        />
        {/* Marcador fixo do limite de 25% */}
        <span
          className="absolute top-0 h-full w-0.5 bg-ink/40"
          style={{ left: `${LIMITE_FALTAS}%` }}
          aria-hidden="true"
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[13px]">
        <span className="font-semibold text-ink tabular">{formatPercent(percentualFaltas)} de faltas</span>
        <span className="text-ink-subtle tabular">limite: {LIMITE_FALTAS}%</span>
      </div>

      <div
        className={`mt-3 rounded-lg px-3 py-2 text-[13px] font-medium ${
          dentroLimite ? 'bg-success-bg text-success-dark' : 'bg-danger-bg text-danger-dark'
        }`}
      >
        {dentroLimite
          ? 'Você está bem dentro do limite de faltas. Continue assim!'
          : 'Você passou do limite de faltas. Fale com a escola o quanto antes.'}
      </div>

      {temAulas && (
        <div className="mt-3 border-t border-line pt-3">
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            className="flex w-full items-center justify-between gap-2 text-[13px] font-semibold text-brand"
          >
            <span>{aberto ? 'Ocultar aulas' : `Ver aulas (${aulas!.length})`}</span>
            <CaretDown size={16} weight="bold" className={aberto ? 'rotate-180 transition' : 'transition'} />
          </button>
          {aberto && (
            <ul className="mt-1 divide-y divide-line">
              {aulas!.map((a) => (
                <AulaLinha key={a.aulaId} aula={a} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function BoletimCard({ boletim, aulas }: { boletim: Boletim; aulas?: AulaFrequencia[] }) {
  const situacao = situacaoAprovacao[boletim.situacao]
  const semestre = formatSemestre(boletim.semestreReferencia)

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(16,24,40,.04)]">
      <header className="flex items-start justify-between gap-4 bg-navy-950 p-5 text-white sm:p-6">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold tracking-tight">
            {boletim.turmaNome ?? 'Minha turma'}
          </h2>
          {semestre && <p className="mt-1 text-sm text-navy-300">{semestre}</p>}
        </div>
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-accent">
          <ChartBar size={22} weight="fill" />
        </div>
      </header>

      <div className="flex flex-col gap-5 p-5 sm:p-6">
        {/* Média em destaque + situação */}
        <div className="flex flex-col items-center gap-3 rounded-xl bg-navy-50 px-4 py-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Média final</p>
          {boletim.media == null ? (
            <p className="text-2xl font-extrabold tracking-tight text-ink-muted">
              Aguardando notas
            </p>
          ) : (
            <p className="text-6xl font-extrabold leading-none tracking-tight text-brand tabular">
              {formatNota(boletim.media)}
            </p>
          )}

          <Badge
            tone={situacao.tone}
            icon={situacaoIcon[boletim.situacao]}
            className="mt-1 px-4 py-2 text-[15px]"
          >
            {situacao.label}
          </Badge>
          <p className="max-w-[320px] text-[14px] text-ink-muted">
            {situacaoFrase[boletim.situacao]}
          </p>
        </div>

        {/* Provas */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NotaTile label={tipoAvaliacaoLabel.MIDTERM} nota={boletim.notaMidterm} />
          <NotaTile label={tipoAvaliacaoLabel.FINAL} nota={boletim.notaFinal} />
        </div>

        {/* Frequência */}
        <FrequenciaCard boletim={boletim} aulas={aulas} />
      </div>
    </article>
  )
}

export default function AlunoBoletimPage() {
  const [semestreId, setSemestreId] = useState<string | undefined>(undefined)
  const { data: boletins, isLoading, isError, refetch } = useMeuBoletim(semestreId)
  const { data: frequencias } = useMinhaFrequencia(semestreId)
  const { data: semestres, isLoading: semestresLoading } = useSemestres()

  // Frequência aula-a-aula indexada por matrícula, para o card de cada turma expandir.
  const aulasPorMatricula = useMemo(() => {
    const m = new Map<string, AulaFrequencia[]>()
    frequencias?.forEach((f) => m.set(f.matriculaId, f.aulas))
    return m
  }, [frequencias])

  const total = boletins?.length ?? 0

  // Sem seleção explícita, reflete o semestre vigente que o backend resolveu no boletim.
  const boletimAtual = boletins?.[0]
  const semestreValue =
    semestreId ??
    boletimAtual?.semestreId ??
    semestres?.find((s) => s.referencia === boletimAtual?.semestreReferencia)?.id

  return (
    <div className="mx-auto w-full max-w-[640px]">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[26px]">
          Meu boletim
        </h1>
        {!isLoading && !isError && total > 0 && (
          <p className="mt-1 text-[15px] text-ink-muted">
            Veja sua média, suas notas e sua frequência em cada turma.
          </p>
        )}
      </header>

      <div className="mb-5">
        <Select value={semestreValue} onValueChange={setSemestreId} disabled={semestresLoading}>
          <SelectTrigger className="h-[46px] w-full rounded border-[1.5px] border-line text-[15px] font-semibold sm:w-[260px]">
            <SelectValue placeholder={semestresLoading ? 'Carregando semestres…' : 'Semestre'} />
          </SelectTrigger>
          <SelectContent>
            {semestres?.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {formatSemestre(s.referencia)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingRows rows={2} />
      ) : isError ? (
        <ErrorState
          title="Não foi possível carregar seu boletim"
          description="Tente novamente em instantes."
          onRetry={() => refetch()}
        />
      ) : total === 0 ? (
        <EmptyState
          icon={<ChartBar size={30} className="text-brand" />}
          title="Seu boletim ainda não está disponível"
          description="Assim que o semestre começar e as notas forem lançadas, tudo aparece aqui."
          tintClass="bg-navy-50"
        />
      ) : (
        <div className="flex flex-col gap-5">
          {boletins!.map((boletim) => (
            <BoletimCard
              key={`${boletim.matriculaId}-${boletim.semestreId}`}
              boletim={boletim}
              aulas={aulasPorMatricula.get(boletim.matriculaId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
