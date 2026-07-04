import { useEffect } from 'react'
import { CaretRight, ListChecks, NotePencil, Student } from '@phosphor-icons/react'
import { Link, useParams } from 'react-router-dom'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { useProfessorHeader } from '@/layouts/ProfessorLayout'
import { useAlunosDaTurma, useMinhasTurmasProfessor } from '@/api/professor'
import type { AlunoNaTurma } from '@/types/api'

function AlunoRow({ aluno, zebra }: { aluno: AlunoNaTurma; zebra: boolean }) {
  return (
    <Link
      to={`/professor/boletim/${aluno.matriculaId}`}
      className={`group flex items-center gap-3 px-6 py-[15px] transition-colors hover:bg-navy-50 ${
        zebra ? 'bg-zebra' : 'bg-surface'
      }`}
    >
      <Avatar nome={aluno.alunoNome} tint />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink">{aluno.alunoNome}</p>
        <p className="mt-0.5 text-[13px] text-ink-subtle">Matrícula ativa</p>
      </div>
      <span className="hidden items-center gap-1 text-sm font-semibold text-navy-600 group-hover:underline sm:inline-flex">
        Ver boletim
        <CaretRight size={16} weight="bold" />
      </span>
      <CaretRight size={18} className="text-ink-subtle sm:hidden" />
    </Link>
  )
}

function AlunosSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(16,24,40,.04)]">
      <div className="divide-y divide-surface-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-6 py-[15px]">
            <Skeleton className="size-10 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40 max-w-[55%]" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ProfessorAlunosPage() {
  const { turmaId } = useParams()
  const { setHeader } = useProfessorHeader()
  const { data: alunos, isLoading, isError, refetch } = useAlunosDaTurma(turmaId)
  const { data: turmas } = useMinhasTurmasProfessor()

  const turma = turmas?.find((t) => t.id === turmaId)
  const total = alunos?.length ?? 0
  const subtitulo =
    total === 1 ? 'Minhas turmas · 1 aluno' : `Minhas turmas · ${total} alunos`

  useEffect(() => {
    setHeader({
      title: turma?.nome ?? 'Alunos da turma',
      subtitle: subtitulo,
      actions: (
        <div className="flex items-center gap-2.5">
          <Button asChild size="sm" className="text-sm">
            <Link to={`/professor/turmas/${turmaId}/chamada`}>
              <ListChecks size={18} />
              Fazer chamada
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm" className="text-sm">
            <Link to={`/professor/turmas/${turmaId}/notas`}>
              <NotePencil size={18} />
              Lançar notas
            </Link>
          </Button>
        </div>
      ),
    })
  }, [setHeader, turma?.nome, subtitulo, turmaId])

  return (
    <div className="w-full">
      <div className="mb-5 inline-flex gap-1 rounded-xl bg-[#eef0f3] p-1">
        <span className="rounded-[9px] bg-surface px-4 py-[9px] text-sm font-semibold text-brand shadow-[0_1px_2px_rgba(16,24,40,.08)]">
          Alunos
        </span>
        <Link
          to={`/professor/turmas/${turmaId}/boletim`}
          className="rounded-[9px] px-4 py-[9px] text-sm font-medium text-ink-muted"
        >
          Boletim da turma
        </Link>
      </div>

      {isLoading ? (
        <AlunosSkeleton />
      ) : isError ? (
        <ErrorState
          title="Não foi possível carregar os alunos"
          description="Tente novamente em instantes."
          onRetry={() => refetch()}
        />
      ) : total === 0 ? (
        <EmptyState
          icon={<Student size={30} className="text-brand" />}
          title="Nenhum aluno matriculado nesta turma ainda"
          description="Assim que uma matrícula for aprovada para esta turma, o aluno aparece aqui."
          tintClass="bg-navy-50"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(16,24,40,.04)]">
          <div className="divide-y divide-surface-2">
            {alunos!.map((aluno, i) => (
              <AlunoRow key={aluno.matriculaId} aluno={aluno} zebra={i % 2 === 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
