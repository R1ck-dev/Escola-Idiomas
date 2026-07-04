import { useEffect } from 'react'
import { CheckCircle, Clock, GraduationCap, Info, XCircle } from '@phosphor-icons/react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { useBoletinsDaTurma, useMinhasTurmasProfessor, useSemestres } from '@/api/professor'
import { useProfessorHeader } from '@/layouts/ProfessorLayout'
import { situacaoAprovacao } from '@/lib/status'
import { cn } from '@/lib/utils'
import type { Boletim, SituacaoAprovacao } from '@/types/api'

const APROVACAO_MINIMA = 70
const LIMITE_FALTAS = 25

const COLUNAS = 'grid grid-cols-[1.8fr_.85fr_.85fr_.85fr_.9fr_.9fr_1.3fr]'

const situacaoIcon: Record<SituacaoAprovacao, typeof CheckCircle> = {
  APROVADO: CheckCircle,
  REPROVADO: XCircle,
  EM_ANDAMENTO: Clock,
}

function formatMedia(n: number) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

function formatNota(n: number | null) {
  return n == null ? null : Math.round(n)
}

/** Cor da média conforme a regra de aprovação (>= 70). */
function corMedia(media: number | null) {
  if (media == null) return 'text-ink-subtle'
  return media >= APROVACAO_MINIMA ? 'text-success' : 'text-danger'
}

/** Cor do % de faltas conforme o limite (25%). */
function corFaltas(percentual: number) {
  if (percentual < LIMITE_FALTAS) return 'text-ink-muted'
  return percentual === LIMITE_FALTAS ? 'font-semibold text-warning-fg' : 'font-semibold text-danger'
}

function CabecalhoTabela() {
  return (
    <div
      className={cn(
        COLUNAS,
        'border-b border-line bg-surface-2 px-6 py-[13px] text-[12px] font-bold uppercase tracking-[.03em] text-ink-subtle',
      )}
    >
      <span>Aluno</span>
      <span className="text-center">Meio</span>
      <span className="text-center">Final</span>
      <span className="text-center">Média</span>
      <span className="text-center">Faltas</span>
      <span className="text-center">% faltas</span>
      <span>Situação</span>
    </div>
  )
}

/** Linha da tabela (desktop). */
function BoletimRow({ boletim, zebra, ultima }: { boletim: Boletim; zebra: boolean; ultima: boolean }) {
  const meio = formatNota(boletim.notaMidterm)
  const final = formatNota(boletim.notaFinal)
  const { media, faltas, totalAulas, percentualFaltas, situacao } = boletim
  const info = situacaoAprovacao[situacao]
  const Icone = situacaoIcon[situacao]

  return (
    <Link
      to={`/professor/boletim/${boletim.matriculaId}`}
      className={cn(
        COLUNAS,
        'items-center px-6 py-[14px] text-[15px] transition-colors hover:bg-navy-50',
        zebra && 'bg-zebra',
        !ultima && 'border-b border-surface-2',
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <Avatar nome={boletim.alunoNome} tint className="size-[34px] text-[12px]" />
        <span className="min-w-0 truncate text-[15px] font-semibold text-ink">{boletim.alunoNome}</span>
      </div>

      <span className={cn('text-center tabular', meio == null ? 'text-ink-subtle' : 'text-ink-muted')}>
        {meio ?? '—'}
      </span>

      <span className={cn('text-center tabular', final == null ? 'text-ink-subtle' : 'text-ink-muted')}>
        {final ?? '—'}
      </span>

      <span className={cn('text-center font-bold tabular', corMedia(media))}>
        {media == null ? '—' : formatMedia(media)}
      </span>

      <span className="text-center tabular text-ink-muted">
        {faltas}/{totalAulas}
      </span>

      <span className={cn('text-center tabular', corFaltas(percentualFaltas))}>{percentualFaltas}%</span>

      <span>
        <Badge tone={info.tone} icon={<Icone size={14} weight="fill" />}>
          {info.label}
        </Badge>
      </span>
    </Link>
  )
}

function Metrica({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">{label}</dt>
      <dd className={cn('mt-0.5 text-[15px] font-bold tabular text-ink-muted', className)}>{value}</dd>
    </div>
  )
}

/** Cartão por aluno (mobile) — o body nunca rola na horizontal. */
function BoletimCard({ boletim }: { boletim: Boletim }) {
  const meio = formatNota(boletim.notaMidterm)
  const final = formatNota(boletim.notaFinal)
  const { media, faltas, totalAulas, percentualFaltas, situacao } = boletim
  const info = situacaoAprovacao[situacao]
  const Icone = situacaoIcon[situacao]

  return (
    <Link
      to={`/professor/boletim/${boletim.matriculaId}`}
      className="block rounded-2xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(16,24,40,.04)] transition-colors hover:bg-navy-50"
    >
      <div className="flex items-center gap-2.5">
        <Avatar nome={boletim.alunoNome} tint className="size-[38px] text-[13px]" />
        <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-ink">{boletim.alunoNome}</span>
        <Badge tone={info.tone} icon={<Icone size={14} weight="fill" />}>
          {info.label}
        </Badge>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-3 border-t border-surface-2 pt-3 text-center">
        <Metrica label="Meio" value={meio == null ? '—' : String(meio)} />
        <Metrica label="Final" value={final == null ? '—' : String(final)} />
        <Metrica label="Média" value={media == null ? '—' : formatMedia(media)} className={corMedia(media)} />
        <Metrica label="Faltas" value={`${faltas}/${totalAulas}`} />
        <Metrica label="% faltas" value={`${percentualFaltas}%`} className={corFaltas(percentualFaltas)} />
      </dl>
    </Link>
  )
}

function TabelaSkeleton() {
  return (
    <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(16,24,40,.04)] md:block">
      <div className="min-w-[760px]">
        <CabecalhoTabela />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={cn(COLUNAS, 'items-center border-b border-surface-2 px-6 py-[14px]')}>
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-[34px] rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex justify-center"><Skeleton className="h-4 w-6" /></div>
            <div className="flex justify-center"><Skeleton className="h-4 w-6" /></div>
            <div className="flex justify-center"><Skeleton className="h-4 w-9" /></div>
            <div className="flex justify-center"><Skeleton className="h-4 w-9" /></div>
            <div className="flex justify-center"><Skeleton className="h-4 w-8" /></div>
            <div><Skeleton className="h-6 w-24 rounded-full" /></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CardsSkeleton() {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-line bg-surface p-4">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-[38px] rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 border-t border-surface-2 pt-3">
            {Array.from({ length: 5 }).map((_, j) => (
              <Skeleton key={j} className="h-8 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ProfessorBoletimTurmaPage() {
  const { turmaId } = useParams()
  const navigate = useNavigate()
  const { setHeader } = useProfessorHeader()

  const [searchParams, setSearchParams] = useSearchParams()
  const semestreId = searchParams.get('semestreId') ?? undefined

  const { data: boletins, isLoading, isError, refetch } = useBoletinsDaTurma(turmaId, semestreId)
  const { data: turmas } = useMinhasTurmasProfessor()
  const { data: semestres } = useSemestres()

  const turma = turmas?.find((t) => t.id === turmaId)
  const semestreVigenteId = boletins?.[0]?.semestreId
  const semestreValue = semestreId ?? semestreVigenteId
  const semestreRef =
    semestres?.find((s) => s.id === semestreValue)?.referencia ?? boletins?.[0]?.semestreReferencia

  useEffect(() => {
    setHeader({
      title: 'Boletim da turma',
      subtitle: [turma?.nome, semestreRef].filter(Boolean).join(' · '),
    })
  }, [setHeader, turma?.nome, semestreRef])

  const total = boletins?.length ?? 0

  // Ao trocar de turma preserva o semestre selecionado na URL (deep-link).
  function selecionarTurma(id: string) {
    navigate({
      pathname: `/professor/turmas/${id}/boletim`,
      search: semestreId ? `?semestreId=${semestreId}` : '',
    })
  }

  function selecionarSemestre(id: string) {
    setSearchParams(id ? { semestreId: id } : {})
  }

  return (
    <div className="w-full">
      {turmaId && (
        <div className="mb-5 inline-flex gap-1 rounded-xl bg-[#eef0f3] p-1">
          <Link
            to={`/professor/turmas/${turmaId}/alunos`}
            className="rounded-[9px] px-4 py-[9px] text-sm font-medium text-ink-muted"
          >
            Alunos
          </Link>
          <span className="rounded-[9px] bg-surface px-4 py-[9px] text-sm font-semibold text-brand shadow-[0_1px_2px_rgba(16,24,40,.08)]">
            Boletim da turma
          </span>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={turmaId} onValueChange={selecionarTurma}>
          <SelectTrigger className="h-[46px] min-w-[240px] rounded border-[1.5px] border-line text-[15px] font-semibold">
            <SelectValue placeholder="Selecione a turma" />
          </SelectTrigger>
          <SelectContent>
            {turmas?.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={semestreValue} onValueChange={selecionarSemestre}>
          <SelectTrigger className="h-[46px] rounded border-[1.5px] border-line text-[15px] font-semibold">
            <SelectValue placeholder="Semestre" />
          </SelectTrigger>
          <SelectContent>
            {semestres?.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.referencia}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="ml-auto flex items-center gap-2 rounded-[10px] border border-info-border bg-navy-50 px-3.5 py-[9px] text-[13px] font-semibold text-brand">
          <Info size={16} weight="fill" />
          Aprovado: média ≥ 70 e no máximo 25% de faltas
        </span>
      </div>

      {!turmaId ? (
        <EmptyState
          icon={<GraduationCap size={30} className="text-brand" />}
          title="Selecione uma turma para ver o boletim"
          description="Escolha uma das suas turmas acima para ver o boletim de cada aluno no semestre."
          tintClass="bg-navy-50"
        />
      ) : isLoading ? (
        <>
          <TabelaSkeleton />
          <CardsSkeleton />
        </>
      ) : isError ? (
        <ErrorState
          title="Não foi possível carregar o boletim"
          description="Tente novamente em instantes."
          onRetry={() => refetch()}
        />
      ) : total === 0 ? (
        <EmptyState
          icon={<GraduationCap size={30} className="text-brand" />}
          title="Nenhum boletim disponível para esta turma/semestre"
          description="Assim que houver matrículas ativas e notas lançadas, os boletins aparecem aqui."
          tintClass="bg-navy-50"
        />
      ) : (
        <>
          {/* Desktop: tabela de 7 colunas */}
          <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(16,24,40,.04)] md:block">
            <div className="min-w-[760px]">
              <CabecalhoTabela />
              {boletins!.map((boletim, i) => (
                <BoletimRow
                  key={boletim.matriculaId}
                  boletim={boletim}
                  zebra={i % 2 === 1}
                  ultima={i === boletins!.length - 1}
                />
              ))}
            </div>
          </div>

          {/* Mobile: cartões por aluno */}
          <div className="flex flex-col gap-3 md:hidden">
            {boletins!.map((boletim) => (
              <BoletimCard key={boletim.matriculaId} boletim={boletim} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
