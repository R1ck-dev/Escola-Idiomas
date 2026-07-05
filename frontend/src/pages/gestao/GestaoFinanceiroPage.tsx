import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CaretLeft, CaretRight, DotsThreeOutline, HouseLine, Lightning, PencilSimple, Plus, Receipt, Trash, User, Wallet } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import type { BadgeTone } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState, ErrorState, LoadingRows } from '@/components/ui/states'
import { toast } from '@/components/ui/toaster'
import { mensagemErro } from '@/lib/api'
import { competenciaAtual, formatBRL, formatCompetencia, formatDate } from '@/lib/format'
import { categoriaDespesaLabel, statusMensalidade } from '@/lib/status'
import {
  useAtualizarDespesa,
  useDashboard,
  useDarBaixa,
  useDespesas,
  useEstornarBaixa,
  useExcluirDespesa,
  useMensalidades,
  useProfessores,
  useRegistrarDespesa,
} from '@/api/gestao'
import type { CategoriaDespesa, Despesa, MensalidadePainel, RegistrarDespesaPayload, StatusMensalidade } from '@/types/api'

/** Data de hoje em "yyyy-MM-dd" (fuso local, sem deslocamento do toISOString). */
function hojeISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ---------------------------------------------------------------------------
// Aba Mensalidades
// ---------------------------------------------------------------------------

type SituacaoFiltro = 'TODAS' | StatusMensalidade

const SITUACAO_OPCOES: { value: SituacaoFiltro; label: string }[] = [
  { value: 'TODAS', label: 'Todas' },
  { value: 'ABERTA', label: 'Em aberto' },
  { value: 'ATRASADA', label: 'Atrasada' },
  { value: 'PAGA', label: 'Paga' },
]

/** Controles Anterior/Próxima + "Página X de Y" (índice 0-based). Some com página única. */
function Paginacao({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      <Button variant="secondary" size="row" disabled={page <= 0} onClick={() => onPage(page - 1)}>
        <CaretLeft size={16} weight="bold" />
        Anterior
      </Button>
      <span className="tabular text-[13px] text-ink-muted">
        Página {page + 1} de {totalPages}
      </span>
      <Button variant="secondary" size="row" disabled={page >= totalPages - 1} onClick={() => onPage(page + 1)}>
        Próxima
        <CaretRight size={16} weight="bold" />
      </Button>
    </div>
  )
}

/** Resumo do topo (3 chips) alimentado pelo dashboard da competência. */
function ResumoMensalidades({ comp }: { comp: string }) {
  const { data, isLoading } = useDashboard(comp)
  const chips = [
    { label: 'Recebido', value: data?.recebido, valueClass: 'text-success-dark' },
    { label: 'Em aberto', value: data?.emAberto, valueClass: 'text-[#144C8F]' },
    { label: 'Em atraso', value: data?.emAtraso, valueClass: 'text-danger-dark' },
  ]
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {chips.map((c) => (
        <div key={c.label} className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(16,24,40,.04)]">
          <div className="text-[13px] font-medium text-ink-muted">{c.label}</div>
          {isLoading ? (
            <Skeleton className="mt-2 h-7 w-28 rounded" />
          ) : (
            <div className={`mt-1.5 text-2xl font-extrabold tabular ${c.valueClass}`}>{formatBRL(c.value)}</div>
          )}
        </div>
      ))}
    </div>
  )
}

/** Dialog de confirmação de baixa (data opcional, padrão hoje). */
function MarcarPagoDialog({ m }: { m: MensalidadePainel }) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState(hojeISO())
  const darBaixa = useDarBaixa()

  function handleOpenChange(o: boolean) {
    setOpen(o)
    if (o) setData(hojeISO())
  }

  async function confirmar() {
    try {
      await darBaixa.mutateAsync({ id: m.id, dataPagamento: data || undefined })
      toast.success('Pagamento registrado.')
      setOpen(false)
    } catch (e) {
      toast.error(mensagemErro(e))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="row">
          Marcar como pago
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar pagamento?</DialogTitle>
          <DialogDescription>
            Registrar a baixa da mensalidade de {m.alunoNome ?? 'aluno'} — {formatCompetencia(m.competencia)}. Informe a
            data do pagamento (padrão: hoje).
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Field label="Data do pagamento" htmlFor={`baixa-${m.id}`} hint="Deixe em hoje se o pagamento foi agora.">
            <Input
              id={`baixa-${m.id}`}
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="tabular"
            />
          </Field>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancelar</Button>
          </DialogClose>
          <Button onClick={confirmar} loading={darBaixa.isPending}>
            Confirmar pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Dialog de confirmação de estorno da baixa (só para mensalidade PAGA). */
function EstornarBaixaDialog({ m }: { m: MensalidadePainel }) {
  const [open, setOpen] = useState(false)
  const estornar = useEstornarBaixa()

  async function confirmar() {
    try {
      await estornar.mutateAsync(m.id)
      toast.success('Baixa estornada.')
      setOpen(false)
    } catch (e) {
      toast.error(mensagemErro(e))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="row">
          Estornar baixa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Estornar baixa?</DialogTitle>
          <DialogDescription>
            A mensalidade de {m.alunoNome ?? 'aluno'} — {formatCompetencia(m.competencia)} deixará de constar como paga e
            voltará a ficar em aberto (ou em atraso, conforme o vencimento). O pagamento registrado em{' '}
            {formatDate(m.dataPagamento)} será desfeito.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancelar</Button>
          </DialogClose>
          <Button variant="destructive" onClick={confirmar} loading={estornar.isPending}>
            Estornar baixa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function LinhaAcao({ m }: { m: MensalidadePainel }) {
  if (m.situacao === 'ABERTA' || m.situacao === 'ATRASADA') {
    return (
      <div className="flex justify-end">
        <MarcarPagoDialog m={m} />
      </div>
    )
  }
  if (m.situacao === 'PAGA') {
    return (
      <div className="flex items-center justify-end gap-3">
        <span className="text-[13px] text-ink-subtle">Baixa em {formatDate(m.dataPagamento)}</span>
        <EstornarBaixaDialog m={m} />
      </div>
    )
  }
  return <span className="text-ink-subtle">—</span>
}

function MensalidadesTab({ comp }: { comp: string }) {
  const [sit, setSit] = useState<SituacaoFiltro>('TODAS')
  const [page, setPage] = useState(0)

  // Volta à primeira página ao trocar de competência ou de filtro de situação.
  useEffect(() => {
    setPage(0)
  }, [comp, sit])

  const { data, isLoading, isError, refetch } = useMensalidades({
    competencia: comp,
    situacao: sit === 'TODAS' ? undefined : sit,
    page,
  })
  const mensalidades = data?.content ?? []
  const temAtraso = mensalidades.some((m) => m.situacao === 'ATRASADA')

  // Se a página atual ficou fora do intervalo (ex.: baixa na última linha), volta para a última válida.
  useEffect(() => {
    if (data && data.totalPages > 0 && page > data.totalPages - 1) {
      setPage(data.totalPages - 1)
    }
  }, [data, page])

  return (
    <div className="flex flex-col gap-6">
      {/* Resumo vem do agregado do servidor (dashboard), não da lista paginada. */}
      <ResumoMensalidades comp={comp} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[15px] text-ink-muted">Mensalidades de {formatCompetencia(comp)}.</p>
        <div className="flex items-center gap-2">
          <Label htmlFor="filtro-situacao" className="text-[13px] font-medium text-ink-muted">
            Situação
          </Label>
          <Select value={sit} onValueChange={(v) => setSit(v as SituacaoFiltro)}>
            <SelectTrigger id="filtro-situacao" className="h-11 w-[168px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SITUACAO_OPCOES.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <LoadingRows rows={5} />
      ) : isError ? (
        <ErrorState title="Não foi possível carregar as mensalidades" onRetry={() => refetch()} />
      ) : mensalidades.length === 0 ? (
        <EmptyState
          icon={<Wallet size={30} className="text-brand" />}
          title="Nenhuma mensalidade nesta competência"
          description={
            sit === 'TODAS'
              ? `Não há mensalidades geradas para ${formatCompetencia(comp)}.`
              : `Nenhuma mensalidade neste filtro em ${formatCompetencia(comp)}.`
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          <Table>
            <THead>
              <TR>
                <TH>Aluno / turma</TH>
                <TH>Vencimento</TH>
                <TH>Valor</TH>
                <TH>Valor atualizado</TH>
                <TH>Situação</TH>
                <TH className="text-right">Ação</TH>
              </TR>
            </THead>
            <TBody>
              {mensalidades.map((m, i) => {
                const s = statusMensalidade[m.situacao]
                const atrasada = m.situacao === 'ATRASADA'
                return (
                  <TR key={m.id} className={i % 2 === 1 ? 'bg-[#FBFCFD]' : undefined}>
                    <TD>
                      <div className="font-semibold text-ink">{m.alunoNome ?? '—'}</div>
                      <div className="text-[13px] text-ink-muted">{m.turmaNome ?? '—'}</div>
                    </TD>
                    <TD className="tabular text-ink-muted">{formatDate(m.vencimento)}</TD>
                    <TD className="tabular font-semibold text-ink">{formatBRL(m.valorEfetivo)}</TD>
                    <TD>
                      {atrasada ? (
                        <div>
                          <div className="tabular font-bold text-danger-dark">{formatBRL(m.valorAtualizado)}</div>
                          <div className="text-[12px] font-medium text-danger-dark">
                            há {m.diasAtraso} {m.diasAtraso === 1 ? 'dia' : 'dias'} · inclui multa + mora
                          </div>
                        </div>
                      ) : (
                        <span className="tabular text-ink-muted">{formatBRL(m.valorAtualizado)}</span>
                      )}
                    </TD>
                    <TD>
                      <Badge tone={s.tone}>
                        {atrasada && m.diasAtraso > 0 ? `${s.label} · ${m.diasAtraso}d` : s.label}
                      </Badge>
                    </TD>
                    <TD className="text-right">
                      <LinhaAcao m={m} />
                    </TD>
                  </TR>
                )
              })}
            </TBody>
          </Table>
          {temAtraso && (
            <p className="px-1 text-[13px] text-ink-muted">
              Nas mensalidades atrasadas, o valor atualizado já inclui multa de 2% + mora de R$ 1/dia (teto de 30 dias).
            </p>
          )}
          <Paginacao page={data?.page ?? 0} totalPages={data?.totalPages ?? 1} onPage={setPage} />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Aba Despesas
// ---------------------------------------------------------------------------

const CATEGORIAS: CategoriaDespesa[] = ['LUZ', 'ALUGUEL', 'REPASSE_PROFESSOR', 'OUTROS']

const CATEGORIA_VISUAL: Record<CategoriaDespesa, { tone: BadgeTone; icon: ReactNode }> = {
  ALUGUEL: { tone: 'neutral', icon: <HouseLine weight="fill" /> },
  LUZ: { tone: 'warning', icon: <Lightning weight="fill" /> },
  REPASSE_PROFESSOR: { tone: 'info', icon: <User weight="fill" /> },
  OUTROS: { tone: 'neutral', icon: <DotsThreeOutline weight="fill" /> },
}

function CategoriaBadge({ categoria }: { categoria: CategoriaDespesa }) {
  const v = CATEGORIA_VISUAL[categoria]
  return (
    <Badge tone={v.tone} icon={v.icon}>
      {categoriaDespesaLabel[categoria]}
    </Badge>
  )
}

const despesaSchema = z
  .object({
    descricao: z.string().trim().min(1, 'Informe a descrição.'),
    categoria: z.string().min(1, 'Selecione a categoria.'),
    valor: z
      .string()
      .min(1, 'Informe o valor.')
      .refine((v) => Number(v) > 0, 'Informe um valor válido.'),
    data: z.string(),
    professorId: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.categoria === 'REPASSE_PROFESSOR' && !v.professorId) {
      ctx.addIssue({ code: 'custom', path: ['professorId'], message: 'Selecione o professor do repasse.' })
    }
  })

type DespesaFormValues = z.infer<typeof despesaSchema>

function toDespesaDefaults(despesa: Despesa | null): DespesaFormValues {
  return {
    descricao: despesa?.descricao ?? '',
    categoria: despesa?.categoria ?? '',
    valor: despesa ? String(despesa.valor) : '',
    data: despesa?.data ?? hojeISO(),
    professorId: despesa?.professorId ?? '',
  }
}

/** Formulário de despesa (RHF + zod), em modo criar ou editar. */
function DespesaForm({ despesa, onDone }: { despesa: Despesa | null; onDone: () => void }) {
  const editando = despesa != null
  const registrar = useRegistrarDespesa()
  const atualizar = useAtualizarDespesa()
  const salvando = registrar.isPending || atualizar.isPending
  const { data: professores } = useProfessores()

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<DespesaFormValues>({
    resolver: zodResolver(despesaSchema),
    defaultValues: toDespesaDefaults(despesa),
  })

  const repasse = watch('categoria') === 'REPASSE_PROFESSOR'

  async function onSubmit(v: DespesaFormValues) {
    const payload: RegistrarDespesaPayload = {
      descricao: v.descricao.trim(),
      categoria: v.categoria as CategoriaDespesa,
      valor: Number(v.valor),
      data: v.data || undefined,
      professorId: v.categoria === 'REPASSE_PROFESSOR' ? v.professorId : undefined,
    }
    try {
      if (despesa) {
        await atualizar.mutateAsync({ id: despesa.id, ...payload })
        toast.success('Despesa atualizada.')
      } else {
        await registrar.mutateAsync(payload)
        toast.success('Despesa registrada.')
      }
      onDone()
    } catch (e) {
      toast.error(mensagemErro(e))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex min-h-0 flex-1 flex-col">
      <SheetHeader>
        <SheetTitle>{editando ? 'Editar despesa' : 'Registrar despesa'}</SheetTitle>
        <SheetDescription>{editando ? 'Atualize os dados da saída.' : 'Lance uma saída do mês.'}</SheetDescription>
      </SheetHeader>
      <SheetBody className="flex flex-col gap-4">
        <Field label="Descrição" htmlFor="descricao" required error={errors.descricao?.message}>
          <Input
            id="descricao"
            placeholder="Ex.: Conta de luz — junho"
            invalid={!!errors.descricao}
            {...register('descricao')}
          />
        </Field>

        <Field label="Categoria" required error={errors.categoria?.message}>
          <Controller
            control={control}
            name="categoria"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger invalid={!!errors.categoria}>
                  <SelectValue placeholder="Escolha a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {categoriaDespesaLabel[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        {repasse && (
          <Field
            label="Professor"
            required
            error={errors.professorId?.message}
            hint="Obrigatório para repasse a professor."
          >
            <Controller
              control={control}
              name="professorId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger invalid={!!errors.professorId}>
                    <SelectValue placeholder="Escolha o professor" />
                  </SelectTrigger>
                  <SelectContent>
                    {(professores ?? []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Valor" htmlFor="valor" required error={errors.valor?.message}>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              className="tabular"
              invalid={!!errors.valor}
              {...register('valor')}
            />
          </Field>
          <Field label="Data" htmlFor="data" error={errors.data?.message}>
            <Input id="data" type="date" className="tabular" invalid={!!errors.data} {...register('data')} />
          </Field>
        </div>
      </SheetBody>
      <SheetFooter>
        <SheetClose asChild>
          <Button type="button" variant="secondary">
            Cancelar
          </Button>
        </SheetClose>
        <Button type="submit" loading={salvando}>
          {editando ? 'Salvar' : 'Registrar'}
        </Button>
      </SheetFooter>
    </form>
  )
}

/** Dialog de confirmação de exclusão de despesa. */
function ExcluirDespesaDialog({ despesa }: { despesa: Despesa }) {
  const [open, setOpen] = useState(false)
  const excluir = useExcluirDespesa()

  async function confirmar() {
    try {
      await excluir.mutateAsync(despesa.id)
      toast.success('Despesa excluída.')
      setOpen(false)
    } catch (e) {
      toast.error(mensagemErro(e))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="row">
          <Trash size={16} />
          Excluir
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir despesa?</DialogTitle>
          <DialogDescription>
            A despesa “{despesa.descricao}” ({formatBRL(despesa.valor)}) será removida permanentemente. Esta ação não
            pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancelar</Button>
          </DialogClose>
          <Button variant="destructive" onClick={confirmar} loading={excluir.isPending}>
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DespesasTab({ comp }: { comp: string }) {
  const { data, isLoading, isError, refetch } = useDespesas(comp)
  const despesas = data ?? []
  const total = despesas.reduce((acc, d) => acc + d.valor, 0)

  const [dialogAberto, setDialogAberto] = useState(false)
  const [editando, setEditando] = useState<Despesa | null>(null)

  function abrirNova() {
    setEditando(null)
    setDialogAberto(true)
  }

  function abrirEdicao(despesa: Despesa) {
    setEditando(despesa)
    setDialogAberto(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[15px] text-ink-muted">Saídas registradas em {formatCompetencia(comp)}.</p>
        <Button variant="cta" onClick={abrirNova}>
          <Plus size={18} weight="bold" />
          Registrar despesa
        </Button>
      </div>

      {isLoading ? (
        <LoadingRows rows={4} />
      ) : isError ? (
        <ErrorState title="Não foi possível carregar as despesas" onRetry={() => refetch()} />
      ) : despesas.length === 0 ? (
        <EmptyState
          icon={<Receipt size={30} className="text-brand" />}
          title="Nenhuma despesa registrada"
          description={`Não há despesas lançadas em ${formatCompetencia(comp)}. Use o botão acima para registrar a primeira.`}
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Descrição</TH>
              <TH>Categoria</TH>
              <TH>Data</TH>
              <TH className="text-right">Valor</TH>
              <TH className="text-right">Ações</TH>
            </TR>
          </THead>
          <TBody>
            {despesas.map((d, i) => (
              <TR key={d.id} className={i % 2 === 1 ? 'bg-[#FBFCFD]' : undefined}>
                <TD className="font-semibold text-ink">{d.descricao}</TD>
                <TD>
                  <CategoriaBadge categoria={d.categoria} />
                </TD>
                <TD className="tabular text-ink-muted">{formatDate(d.data)}</TD>
                <TD className="text-right tabular font-semibold text-ink">{formatBRL(d.valor)}</TD>
                <TD className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="row" onClick={() => abrirEdicao(d)}>
                      <PencilSimple size={16} />
                      Editar
                    </Button>
                    <ExcluirDespesaDialog despesa={d} />
                  </div>
                </TD>
              </TR>
            ))}
            <TR className="bg-canvas">
              <TD colSpan={3} className="font-semibold text-ink-muted">
                Total de despesas em {formatCompetencia(comp)}
              </TD>
              <TD className="text-right text-lg font-extrabold tabular text-brand">{formatBRL(total)}</TD>
              <TD />
            </TR>
          </TBody>
        </Table>
      )}

      <Sheet open={dialogAberto} onOpenChange={setDialogAberto}>
        <SheetContent>
          {dialogAberto && (
            <DespesaForm
              key={editando?.id ?? 'nova'}
              despesa={editando}
              onDone={() => setDialogAberto(false)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export default function GestaoFinanceiroPage() {
  const [comp, setComp] = useState(competenciaAtual())
  const [tab, setTab] = useState('mensalidades')

  return (
    <div>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-[-.015em] text-ink">Financeiro</h1>
          <p className="mt-1 text-[15px] text-ink-muted">Mensalidades recebidas e despesas do mês.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="competencia">Competência</Label>
          <Input
            id="competencia"
            type="month"
            value={comp}
            onChange={(e) => setComp(e.target.value)}
            className="w-[190px] tabular"
          />
        </div>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="mensalidades">Mensalidades</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
        </TabsList>
        <TabsContent value="mensalidades" className="mt-6">
          <MensalidadesTab comp={comp} />
        </TabsContent>
        <TabsContent value="despesas" className="mt-6">
          <DespesasTab comp={comp} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
