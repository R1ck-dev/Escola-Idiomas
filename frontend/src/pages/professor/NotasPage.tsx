import { useEffect, useState } from 'react'
import { Check, Exam, Info } from '@phosphor-icons/react'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { toast } from '@/components/ui/toaster'
import { useAlunosDaTurma, useBoletinsDaTurma, useLancarNota, useMinhasTurmasProfessor } from '@/api/professor'
import { useProfessorHeader } from '@/layouts/ProfessorLayout'
import { mensagemErro } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { AlunoNaTurma } from '@/types/api'

const APROVACAO_MINIMA = 70

function formatMedia(n: number) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

/** Nota já lançada (número ou null) para o texto do input, no padrão pt-BR. */
function notaParaInput(n: number | null): string {
  return n == null ? '' : String(n).replace('.', ',')
}

type NotaParse = { preenchida: boolean; valida: boolean; valor: number | null }

function parseNota(v: string): NotaParse {
  const t = v.trim()
  if (t === '') return { preenchida: false, valida: true, valor: null }
  const n = Number(t.replace(',', '.'))
  const valida = Number.isFinite(n) && n >= 0 && n <= 100
  return { preenchida: true, valida, valor: valida ? n : null }
}

type NotaValores = { meio: string; final: string }

const inputBase =
  'h-11 w-[88px] rounded-[10px] border-[1.5px] border-line-strong text-center text-base tabular outline-none transition focus:border-navy-600'

function NotaInput({
  value,
  invalid,
  onChange,
  'aria-label': ariaLabel,
}: {
  value: string
  invalid: boolean
  onChange: (v: string) => void
  'aria-label': string
}) {
  return (
    <div className="flex flex-col items-center">
      <input
        type="text"
        inputMode="numeric"
        placeholder="—"
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputBase, invalid && 'border-danger bg-[#fef6f3]')}
      />
      {invalid && <span className="mt-[5px] text-[12px] font-semibold text-[#c8461f]">0 a 100</span>}
    </div>
  )
}

function NotaRow({
  aluno,
  zebra,
  valores,
  onChange,
}: {
  aluno: AlunoNaTurma
  zebra: boolean
  valores: NotaValores
  onChange: (campo: keyof NotaValores, valor: string) => void
}) {
  const meio = parseNota(valores.meio)
  const fim = parseNota(valores.final)

  const media =
    meio.preenchida && meio.valida && fim.preenchida && fim.valida
      ? (meio.valor! + fim.valor!) / 2
      : null

  return (
    <div
      className={cn(
        'grid grid-cols-[2fr_1fr_1fr_1fr] items-center border-b border-surface-2 px-6 py-3',
        zebra && 'bg-zebra',
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Avatar nome={aluno.alunoNome} tint className="size-9 text-[13px]" />
        <p className="min-w-0 truncate text-[15px] font-semibold text-ink">{aluno.alunoNome}</p>
      </div>

      <div className="flex justify-center">
        <NotaInput
          value={valores.meio}
          invalid={meio.preenchida && !meio.valida}
          onChange={(v) => onChange('meio', v)}
          aria-label={`Prova do meio de ${aluno.alunoNome}`}
        />
      </div>

      <div className="flex justify-center">
        <NotaInput
          value={valores.final}
          invalid={fim.preenchida && !fim.valida}
          onChange={(v) => onChange('final', v)}
          aria-label={`Prova final de ${aluno.alunoNome}`}
        />
      </div>

      <div
        className={cn(
          'text-center text-[17px] font-bold tabular',
          media == null
            ? 'text-ink-subtle'
            : media >= APROVACAO_MINIMA
              ? 'text-success-dark'
              : 'text-danger-dark',
        )}
      >
        {media == null ? '—' : formatMedia(media)}
      </div>
    </div>
  )
}

const COLUNAS = 'grid grid-cols-[2fr_1fr_1fr_1fr]'

function CabecalhoTabela() {
  return (
    <div
      className={cn(
        COLUNAS,
        'border-b border-line bg-canvas px-6 py-[13px] text-[12px] font-bold uppercase tracking-[.04em] text-ink-muted',
      )}
    >
      <span>Aluno</span>
      <span className="text-center">Prova do meio</span>
      <span className="text-center">Prova final</span>
      <span className="text-center">Média</span>
    </div>
  )
}

function TabelaSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(16,24,40,.04)]">
      <CabecalhoTabela />
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className={cn(COLUNAS, 'items-center border-b border-surface-2 px-6 py-3')}>
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-11 w-[88px] rounded-[10px]" />
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-11 w-[88px] rounded-[10px]" />
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-5 w-10" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function NotasPage() {
  const { turmaId } = useParams()
  const navigate = useNavigate()
  const { setHeader } = useProfessorHeader()

  const { data: alunos, isLoading, isError, refetch } = useAlunosDaTurma(turmaId)
  const { data: turmas } = useMinhasTurmasProfessor()
  const { data: boletins } = useBoletinsDaTurma(turmaId)
  const lancar = useLancarNota()

  const turma = turmas?.find((t) => t.id === turmaId)
  const total = alunos?.length ?? 0

  const [notas, setNotas] = useState<Record<string, NotaValores>>({})

  // Semeia os inputs com as notas já lançadas (por matrícula). Reexecuta ao trocar de turma.
  useEffect(() => {
    if (!boletins) return
    const inicial: Record<string, NotaValores> = {}
    for (const b of boletins) {
      inicial[b.matriculaId] = {
        meio: notaParaInput(b.notaMidterm),
        final: notaParaInput(b.notaFinal),
      }
    }
    setNotas(inicial)
  }, [boletins])

  useEffect(() => {
    setHeader({
      title: 'Lançar notas',
      subtitle: [turma?.nome, '2026-2'].filter(Boolean).join(' · '),
    })
  }, [setHeader, turma?.nome])

  function valoresDe(matriculaId: string): NotaValores {
    return notas[matriculaId] ?? { meio: '', final: '' }
  }

  function alterarNota(matriculaId: string, campo: keyof NotaValores, valor: string) {
    setNotas((prev) => ({
      ...prev,
      [matriculaId]: { ...valoresDe(matriculaId), [campo]: valor },
    }))
  }

  async function salvarTodas() {
    if (!alunos) return

    const linhas = alunos.map((aluno) => {
      const v = valoresDe(aluno.matriculaId)
      return { aluno, meio: parseNota(v.meio), fim: parseNota(v.final) }
    })

    const temInvalida = linhas.some(
      (l) => (l.meio.preenchida && !l.meio.valida) || (l.fim.preenchida && !l.fim.valida),
    )
    if (temInvalida) {
      toast.error('Há notas fora da escala de 0 a 100. Corrija antes de salvar.')
      return
    }

    const chamadas = []
    for (const l of linhas) {
      if (l.meio.preenchida && l.meio.valida)
        chamadas.push(
          lancar.mutateAsync({ matriculaId: l.aluno.matriculaId, tipo: 'MIDTERM', nota: l.meio.valor! }),
        )
      if (l.fim.preenchida && l.fim.valida)
        chamadas.push(
          lancar.mutateAsync({ matriculaId: l.aluno.matriculaId, tipo: 'FINAL', nota: l.fim.valor! }),
        )
    }

    if (chamadas.length === 0) {
      toast.error('Preencha ao menos uma nota para salvar.')
      return
    }

    try {
      await Promise.all(chamadas)
      toast.success('Notas salvas.')
    } catch (e) {
      toast.error(mensagemErro(e))
    }
  }

  return (
    <div className="w-full">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Select
          value={turmaId}
          onValueChange={(id) => navigate(`/professor/turmas/${id}/notas`)}
        >
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

        <p className="flex items-center gap-[7px] text-sm text-ink-muted">
          <Info size={18} className="text-info" />
          Escala de 0 a 100. A média aparece quando as duas notas forem lançadas.
        </p>
      </div>

      {!turmaId ? (
        <EmptyState
          icon={<Exam size={30} className="text-brand" />}
          title="Selecione uma turma para lançar notas"
          tintClass="bg-navy-50"
        />
      ) : isLoading ? (
        <TabelaSkeleton />
      ) : isError ? (
        <ErrorState
          title="Não foi possível carregar os alunos"
          description="Tente novamente em instantes."
          onRetry={() => refetch()}
        />
      ) : total === 0 ? (
        <EmptyState
          icon={<Exam size={30} className="text-brand" />}
          title="Esta turma ainda não tem alunos"
          description="Quando houver alunos matriculados, você poderá lançar as notas deles por aqui."
          tintClass="bg-navy-50"
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(16,24,40,.04)]">
            <CabecalhoTabela />
            {alunos!.map((aluno, i) => (
              <NotaRow
                key={aluno.matriculaId}
                aluno={aluno}
                zebra={i % 2 === 0}
                valores={valoresDe(aluno.matriculaId)}
                onChange={(campo, valor) => alterarNota(aluno.matriculaId, campo, valor)}
              />
            ))}
          </div>

          <div className="mt-[18px] flex justify-end">
            <Button variant="cta" size="save" loading={lancar.isPending} onClick={salvarTodas}>
              <Check size={19} /> Salvar notas
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
