import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CalendarBlank, CaretLeft, CaretRight, Check, HandTap } from '@phosphor-icons/react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { toast } from '@/components/ui/toaster'
import { formatDate } from '@/lib/format'
import { mensagemErro } from '@/lib/api'
import { useChamada, useDatasComChamada, useMinhasTurmasProfessor, useRegistrarChamada } from '@/api/professor'
import { useProfessorHeader } from '@/layouts/ProfessorLayout'
import type { Chamada } from '@/types/api'

/** Data de hoje no fuso local, no formato yyyy-MM-dd (o input date usa esse formato). */
function hojeISO(): string {
  const agora = new Date()
  const local = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

/** Token do dia da semana (como salvo na turma) -> índice JS getDay() (0=dom..6=sáb). */
const DIA_TOKEN: Record<string, number> = { DOM: 0, SEG: 1, TER: 2, QUA: 3, QUI: 4, SEX: 5, SAB: 6 }
const DIA_LABEL = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

/** "SEG,QUA" -> Set {1,3}. Vazio = turma sem grade (sem restrição de dia). */
function parseDiasDeAula(diasSemana?: string | null): Set<number> {
  const set = new Set<number>()
  for (const t of (diasSemana ?? '').split(',')) {
    const d = DIA_TOKEN[t.trim().toUpperCase()]
    if (d !== undefined) set.add(d)
  }
  return set
}

/** "SEG,QUA" -> "seg/qua" para exibir ao professor. */
function rotuloDias(diasSemana?: string | null): string {
  return [...parseDiasDeAula(diasSemana)].sort().map((d) => DIA_LABEL[d]).join('/')
}

function diaDaSemana(iso: string): number {
  return new Date(`${iso}T00:00:00`).getDay()
}

function somaDias(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + n)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dia}`
}

/** Dia de aula anterior a `iso` (procura até 7 dias atrás). */
function aulaAnterior(iso: string, dias: Set<number>): string | null {
  for (let i = 1; i <= 7; i++) {
    const c = somaDias(iso, -i)
    if (dias.has(diaDaSemana(c))) return c
  }
  return null
}

/** Próximo dia de aula após `iso`, sem passar de `maxIso`. */
function aulaProxima(iso: string, dias: Set<number>, maxIso: string): string | null {
  for (let i = 1; i <= 7; i++) {
    const c = somaDias(iso, i)
    if (c > maxIso) return null
    if (dias.has(diaDaSemana(c))) return c
  }
  return null
}

/** `iso` se for dia de aula; senão, o dia de aula anterior mais próximo. */
function ajustarParaDiaDeAula(iso: string, dias: Set<number>): string {
  return dias.has(diaDaSemana(iso)) ? iso : (aulaAnterior(iso, dias) ?? iso)
}

/**
 * Cartão-toggle de presença. O cartão inteiro é o alvo de toque: tocar alterna
 * Presente ⇄ Falta. Presente = verde suave; Falta = fundo/borda avermelhados.
 */
function AlunoCartao({
  nome,
  presente,
  onToggle,
}: {
  nome: string
  presente: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={presente}
      aria-label={`${nome}: ${presente ? 'presente' : 'falta'}`}
      onClick={onToggle}
      className={`relative flex flex-col items-center gap-[11px] rounded-xl p-5 text-center shadow-[0_1px_2px_rgba(16,24,40,.04)] transition-colors ${
        presente ? 'border-[1.5px] border-[#c7e8d5] bg-surface' : 'border-[1.5px] border-[#f3c5b4] bg-[#fef6f3]'
      }`}
    >
      <span
        className={`absolute right-3 top-3 size-[22px] rounded-full ${presente ? 'bg-success' : 'bg-danger'}`}
      />
      {presente ? (
        <Avatar nome={nome} tint className="size-14 text-[18px]" />
      ) : (
        <Avatar nome={nome} className="size-14 bg-danger-bg text-[18px] text-danger-dark" />
      )}
      <span className="text-[15px] font-semibold leading-[1.3] text-ink">{nome}</span>
      <span
        className={`rounded-full px-3.5 py-[5px] text-[13px] font-semibold ${
          presente ? 'bg-success-bg text-success-dark' : 'bg-danger-bg text-danger-dark'
        }`}
      >
        {presente ? 'Presente' : 'Falta'}
      </span>
    </button>
  )
}

export default function ChamadaPage() {
  const { turmaId } = useParams<{ turmaId: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<string>(hojeISO())

  const { setHeader } = useProfessorHeader()

  const { data: turmas } = useMinhasTurmasProfessor()
  const { data: chamada, isLoading, isError, refetch } = useChamada(turmaId, data)
  const { data: datasComChamada } = useDatasComChamada(turmaId)
  const registrar = useRegistrarChamada()

  const turma = turmas?.find((t) => t.id === turmaId)
  const turmaNome = turma?.nome

  // Dias de aula da turma (RN-35). Vazio = turma sem grade → sem restrição de dia.
  const diasDeAula = useMemo(() => parseDiasDeAula(turma?.diasSemana), [turma])
  const temGrade = diasDeAula.size > 0

  // Ao abrir a turma, se a data cair fora da grade (ex.: hoje não é dia de aula), volta ao último dia de aula.
  useEffect(() => {
    if (temGrade && !diasDeAula.has(diaDaSemana(data))) {
      setData((cur) => ajustarParaDiaDeAula(cur, diasDeAula))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turmaId, temGrade])

  // Navegação: com grade, salta entre dias de aula; sem grade, entre os dias já com chamada.
  const datasComReg = useMemo(() => datasComChamada ?? [], [datasComChamada])
  const dataAnterior = useMemo(() => {
    if (temGrade) return aulaAnterior(data, diasDeAula)
    const anteriores = datasComReg.filter((d) => d < data)
    return anteriores.length ? anteriores[anteriores.length - 1] : null
  }, [temGrade, diasDeAula, datasComReg, data])
  const dataProxima = useMemo(() => {
    if (temGrade) return aulaProxima(data, diasDeAula, hojeISO())
    return datasComReg.find((d) => d > data) ?? null
  }, [temGrade, diasDeAula, datasComReg, data])

  // Marcações locais por matrícula. presente===null (aula ainda não criada) vira "presente" por padrão.
  const [marcacoes, setMarcacoes] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!chamada) return
    const inicial: Record<string, boolean> = {}
    for (const p of chamada.presencas) {
      inicial[p.matriculaId] = p.presente === null ? true : p.presente
    }
    setMarcacoes(inicial)
  }, [chamada])

  const totais = useMemo(() => {
    const presencas = chamada?.presencas ?? []
    const presentes = presencas.filter((p) => marcacoes[p.matriculaId] ?? true).length
    return { presentes, faltas: presencas.length - presentes, total: presencas.length }
  }, [chamada, marcacoes])

  const ehHoje = data === hojeISO()

  const dataExibida = `${ehHoje ? 'Hoje · ' : ''}${formatDate(data)}`

  useEffect(() => {
    setHeader({
      title: 'Chamada',
      subtitle: turmaNome ? `${turmaNome} · ${dataExibida}` : undefined,
    })
  }, [setHeader, turmaNome, dataExibida])

  async function salvar(c: Chamada) {
    if (!turmaId) return
    try {
      await registrar.mutateAsync({
        turmaId,
        data,
        presencas: c.presencas.map((p) => ({
          matriculaId: p.matriculaId,
          // Sem valor marcado, o padrão é presente=true (todos começam presentes).
          presente: marcacoes[p.matriculaId] ?? true,
        })),
      })
      toast.success('Chamada salva!')
    } catch (e) {
      toast.error(mensagemErro(e))
    }
  }

  return (
    <div className="w-full">
      {/* Barra de filtros: turma + data */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={turmaId} onValueChange={(id) => navigate(`/professor/turmas/${id}/chamada`)}>
          <SelectTrigger className="h-[46px] min-w-[240px] rounded border-line text-[15px] font-semibold">
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

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            disabled={!dataAnterior}
            onClick={() => dataAnterior && setData(dataAnterior)}
            aria-label="Dia anterior com chamada"
            title={dataAnterior ? `Ir para ${formatDate(dataAnterior)}` : 'Não há dia anterior com chamada'}
          >
            <CaretLeft size={18} weight="bold" />
          </Button>

          <label className="relative inline-flex h-[46px] items-center gap-2 rounded border-[1.5px] border-line bg-surface px-4 text-[15px] font-semibold text-ink">
            <CalendarBlank size={18} className="text-ink-muted" />
            <span className="tabular">
              {ehHoje ? 'Hoje · ' : ''}
              {formatDate(data)}
            </span>
            <input
              type="date"
              value={data}
              max={hojeISO()}
              onChange={(e) => {
                const v = e.target.value
                if (!v) return
                if (temGrade && !diasDeAula.has(diaDaSemana(v))) {
                  toast.error(`Esta turma tem aula só em ${rotuloDias(turma?.diasSemana)}.`)
                  return
                }
                setData(v)
              }}
              aria-label="Data da chamada"
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>

          <Button
            variant="secondary"
            size="icon"
            disabled={!dataProxima}
            onClick={() => dataProxima && setData(dataProxima)}
            aria-label="Próximo dia com chamada"
            title={dataProxima ? `Ir para ${formatDate(dataProxima)}` : 'Não há dia posterior com chamada'}
          >
            <CaretRight size={18} weight="bold" />
          </Button>
        </div>
      </div>

      {turmaId && temGrade && (
        <p className="mb-4 text-[13px] text-ink-muted">
          Aulas em {rotuloDias(turma?.diasSemana)} — use ◀ ▶ para andar pelos dias de aula.
        </p>
      )}
      {turmaId && !temGrade && datasComReg.length > 0 && (
        <p className="mb-4 text-[13px] text-ink-muted">
          {datasComReg.length === 1 ? '1 dia com chamada registrada' : `${datasComReg.length} dias com chamada registrada`} — use ◀ ▶ para revisar/corrigir.
        </p>
      )}

      {!turmaId ? (
        <EmptyState
          icon={<HandTap size={30} className="text-brand" />}
          title="Selecione uma turma para começar a chamada."
          tintClass="bg-navy-50"
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[168px] rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Não foi possível carregar a chamada"
          description="Verifique sua conexão e tente novamente."
          onRetry={() => refetch()}
        />
      ) : !chamada || chamada.presencas.length === 0 ? (
        <EmptyState
          icon={<HandTap size={30} className="text-brand" />}
          title="Esta turma não tem alunos para a chamada."
          description="Quando houver alunos matriculados, eles aparecem aqui para você marcar presença."
          tintClass="bg-navy-50"
        />
      ) : (
        <>
          {/* Faixa de instrução + contadores ao vivo */}
          <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3 rounded-xl border border-info-border bg-navy-50 px-[18px] py-3.5">
            <div className="flex items-center gap-2">
              <HandTap size={19} weight="fill" className="text-brand" />
              <span className="text-[15px] font-semibold text-brand">
                Todos começam presentes. Toque em quem faltou.
              </span>
            </div>
            <div className="flex gap-[22px] text-base font-bold tabular">
              <span className="text-success-dark">{totais.presentes} presentes</span>
              <span className="text-danger-dark">{totais.faltas} faltas</span>
            </div>
          </div>

          {/* Grid de cartões-toggle */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {chamada.presencas.map((p) => {
              const presente = marcacoes[p.matriculaId] ?? true
              return (
                <AlunoCartao
                  key={p.matriculaId}
                  nome={p.alunoNome}
                  presente={presente}
                  onToggle={() => setMarcacoes((m) => ({ ...m, [p.matriculaId]: !presente }))}
                />
              )
            })}
          </div>

          {/* Rodapé de ação */}
          <div className="mt-6 flex justify-end">
            <Button variant="cta" size="save" onClick={() => salvar(chamada)} loading={registrar.isPending}>
              <Check size={19} /> Salvar chamada
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
