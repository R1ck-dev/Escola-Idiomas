import { BookOpen, CalendarBlank, Clock, Student } from '@phosphor-icons/react'
import { Avatar } from '@/components/ui/avatar'
import { EmptyState, ErrorState, LoadingRows } from '@/components/ui/states'
import { formatHora } from '@/lib/format'
import { useMinhasTurmasAluno } from '@/api/aluno'
import type { TurmaDoAluno } from '@/types/api'

const DIAS: Record<string, string> = {
  DOM: 'Domingo',
  SEG: 'Segunda',
  TER: 'Terça',
  QUA: 'Quarta',
  QUI: 'Quinta',
  SEX: 'Sexta',
  SAB: 'Sábado',
  DOMINGO: 'Domingo',
  SEGUNDA: 'Segunda',
  TERCA: 'Terça',
  QUARTA: 'Quarta',
  QUINTA: 'Quinta',
  SEXTA: 'Sexta',
  SABADO: 'Sábado',
}

/** "SEG,QUA" → "Segunda e quarta"; mantém o texto cru se não reconhecer. */
function formatDias(dias: string | null): string {
  if (!dias) return 'A combinar'
  const partes = dias
    .split(/[,;/]+/)
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => {
      const chave = d.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      return DIAS[chave] ?? d
    })
  if (partes.length === 0) return 'A combinar'
  if (partes.length === 1) return partes[0]
  const inicio = partes.slice(0, -1).join(', ')
  const ultimo = partes[partes.length - 1].toLowerCase()
  return `${inicio} e ${ultimo}`
}

function formatHorario(inicio: string | null, fim: string | null): string {
  const ini = formatHora(inicio)
  const f = formatHora(fim)
  if (ini && f) return `${ini} – ${f}`
  if (ini) return `A partir de ${ini}`
  return 'A combinar'
}

function TurmaCard({ turma }: { turma: TurmaDoAluno }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(16,24,40,.04)]">
      <header className="flex items-start justify-between gap-4 bg-navy-950 p-5 text-white sm:p-6">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold tracking-tight">{turma.nome}</h2>
          <p className="mt-1 text-sm text-navy-300">
            {turma.idioma}
            {turma.nivel ? ` · Nível ${turma.nivel}` : ''}
          </p>
        </div>
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-accent">
          <BookOpen size={22} weight="fill" />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <div className="flex items-center gap-3 sm:col-span-2">
          {turma.professorNome ? (
            <Avatar nome={turma.professorNome} tint />
          ) : (
            <div className="grid size-10 shrink-0 place-items-center rounded-full border border-dashed border-line text-ink-subtle">
              <Student size={18} />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
              Professor(a)
            </p>
            {turma.professorNome ? (
              <p className="mt-0.5 truncate font-semibold text-ink">{turma.professorNome}</p>
            ) : (
              <p className="mt-0.5 font-semibold text-ink-muted">A definir</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-navy-50 text-brand">
            <CalendarBlank size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Dias</p>
            <p className="mt-0.5 font-semibold text-ink">{formatDias(turma.diasSemana)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-navy-50 text-brand">
            <Clock size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Horário</p>
            <p className="mt-0.5 font-semibold text-ink tabular">
              {formatHorario(turma.horaInicio, turma.horaFim)}
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function AlunoTurmasPage() {
  const { data: turmas, isLoading, isError, refetch } = useMinhasTurmasAluno()

  const total = turmas?.length ?? 0
  const subtitulo =
    total === 1
      ? 'Você está matriculado(a) em 1 turma.'
      : `Você está matriculado(a) em ${total} turmas.`

  return (
    <div className="mx-auto w-full max-w-[640px]">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[26px]">
          Minhas turmas
        </h1>
        {!isLoading && !isError && total > 0 && (
          <p className="mt-1 text-[15px] text-ink-muted">{subtitulo}</p>
        )}
      </header>

      {isLoading ? (
        <LoadingRows rows={2} />
      ) : isError ? (
        <ErrorState
          title="Não foi possível carregar suas turmas"
          description="Tente novamente em instantes."
          onRetry={() => refetch()}
        />
      ) : total === 0 ? (
        <EmptyState
          icon={<Student size={30} className="text-brand" />}
          title="Você ainda não está em nenhuma turma"
          description="Assim que sua matrícula for aprovada, sua turma aparece aqui."
          tintClass="bg-navy-50"
        />
      ) : (
        <div className="flex flex-col gap-4">
          {turmas!.map((turma) => (
            <TurmaCard key={turma.id} turma={turma} />
          ))}
        </div>
      )}
    </div>
  )
}
