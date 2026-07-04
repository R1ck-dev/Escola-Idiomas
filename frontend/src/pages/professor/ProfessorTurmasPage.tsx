import { ChalkboardTeacher, GraduationCap, ListChecks, NotePencil, Student } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { formatHora } from '@/lib/format'
import { useMinhasTurmasProfessor } from '@/api/professor'
import { useAuth } from '@/auth/AuthContext'
import type { Turma } from '@/types/api'

const DIAS: Record<string, string> = {
  DOM: 'Dom',
  SEG: 'Seg',
  TER: 'Ter',
  QUA: 'Qua',
  QUI: 'Qui',
  SEX: 'Sex',
  SAB: 'Sab',
  DOMINGO: 'Dom',
  SEGUNDA: 'Seg',
  TERCA: 'Ter',
  QUARTA: 'Qua',
  QUINTA: 'Qui',
  SEXTA: 'Sex',
  SABADO: 'Sab',
}

function primeiroNome(nome: string | null | undefined): string {
  return nome?.trim().split(/\s+/)[0] || 'professor'
}

/** "SEG,QUA" → "Seg e Qua"; mantém o texto cru se não reconhecer. */
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
  const ultimo = partes[partes.length - 1]
  return `${inicio} e ${ultimo}`
}

function formatHorario(inicio: string | null, fim: string | null): string {
  const ini = formatHora(inicio)
  const f = formatHora(fim)
  if (ini && f) return `${ini} – ${f}`
  if (ini) return `A partir de ${ini}`
  return 'A combinar'
}

function formatAlunos(ocupacao: number | undefined): string {
  const n = ocupacao ?? 0
  return `${n} aluno${n === 1 ? '' : 's'}`
}

function TurmaCard({ turma }: { turma: Turma }) {
  return (
    <article className="rounded-xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(16,24,40,.04)]">
      <div className="flex items-center gap-3.5">
        <div className="grid size-[52px] shrink-0 place-items-center rounded-[14px] bg-navy-50">
          <ChalkboardTeacher size={26} weight="fill" className="text-brand" />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-[19px] font-bold text-ink">{turma.nome}</h2>
          <p className="mt-0.5 text-sm text-ink-muted tabular">
            {formatDias(turma.diasSemana)} · {formatHorario(turma.horaInicio, turma.horaFim)} ·{' '}
            {formatAlunos(turma.ocupacaoAtual)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button asChild className="w-full sm:flex-1">
          <Link to={`/professor/turmas/${turma.id}/chamada`}>
            <ListChecks size={19} />
            Fazer chamada
          </Link>
        </Button>
        <Button asChild variant="secondary" className="w-full sm:flex-1">
          <Link to={`/professor/turmas/${turma.id}/notas`}>
            <NotePencil size={19} />
            Lançar notas
          </Link>
        </Button>
        <Button asChild variant="secondary" className="w-full sm:flex-1">
          <Link to={`/professor/turmas/${turma.id}/boletim`}>
            <GraduationCap size={19} />
            Ver boletins
          </Link>
        </Button>
      </div>
    </article>
  )
}

export default function ProfessorTurmasPage() {
  const { user } = useAuth()
  const { data: turmas, isLoading, isError, refetch } = useMinhasTurmasProfessor()

  const total = turmas?.length ?? 0
  const subtitulo = `${total} turma${total === 1 ? '' : 's'} · 2º semestre de 2026`

  return (
    <div className="w-full">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[26px]">
          Minhas turmas
        </h1>
        {!isLoading && !isError && total > 0 && (
          <p className="mt-1 text-[15px] text-ink-muted tabular">{subtitulo}</p>
        )}
      </header>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-[140px] w-full rounded-xl" />
          <Skeleton className="h-[140px] w-full rounded-xl" />
          <Skeleton className="h-[140px] w-full rounded-xl" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Não foi possível carregar suas turmas"
          description="Tente novamente em instantes."
          onRetry={() => refetch()}
        />
      ) : total === 0 ? (
        <EmptyState
          icon={<Student size={30} className="text-brand" />}
          title="Você ainda não tem turmas neste semestre"
          description="Assim que uma turma for atribuída a você, ela aparece aqui."
          tintClass="bg-navy-50"
        />
      ) : (
        <>
          <p className="mb-[22px] text-base text-ink-muted">
            Olá, {primeiroNome(user?.nome)}! Escolha uma turma para fazer a chamada, lançar notas ou
            ver os boletins.
          </p>
          <div className="flex flex-col gap-4">
            {turmas!.map((turma) => (
              <TurmaCard key={turma.id} turma={turma} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
