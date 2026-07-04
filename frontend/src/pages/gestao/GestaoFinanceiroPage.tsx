import { useState } from 'react'
import type { ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DotsThreeOutline, HouseLine, Lightning, Plus, Receipt, User, Wallet } from '@phosphor-icons/react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState, ErrorState, LoadingRows } from '@/components/ui/states'
import { toast } from '@/components/ui/toaster'
import { mensagemErro } from '@/lib/api'
import { competenciaAtual, formatBRL, formatCompetencia, formatDate } from '@/lib/format'
import { categoriaDespesaLabel, statusMensalidade } from '@/lib/status'
import {
  useDashboard,
  useDarBaixa,
  useDespesas,
  useMensalidades,
  useProfessores,
  useRegistrarDespesa,
} from '@/api/gestao'
import type { CategoriaDespesa, MensalidadePainel, RegistrarDespesaPayload } from '@/types/api'

/** Data de hoje em "yyyy-MM-dd" (fuso local, sem deslocamento do toISOString). */
function hojeISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ---------------------------------------------------------------------------
// Aba Mensalidades
// ---------------------------------------------------------------------------

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

function LinhaAcao({ m }: { m: MensalidadePainel }) {
  if (m.situacao === 'ABERTA' || m.situacao === 'ATRASADA') {
    return (
      <div className="flex justify-end">
        <MarcarPagoDialog m={m} />
      </div>
    )
  }
  if (m.situacao === 'PAGA') {
    return <span className="text-[13px] text-ink-subtle">Baixa em {formatDate(m.dataPagamento)}</span>
  }
  return <span className="text-ink-subtle">—</span>
}

function MensalidadesTab({ comp }: { comp: string }) {
  const { data, isLoading, isError, refetch } = useMensalidades(comp)
  const mensalidades = data ?? []
  const temAtraso = mensalidades.some((m) => m.situacao === 'ATRASADA')

  return (
    <div className="flex flex-col gap-6">
      <ResumoMensalidades comp={comp} />

      {isLoading ? (
        <LoadingRows rows={5} />
      ) : isError ? (
        <ErrorState title="Não foi possível carregar as mensalidades" onRetry={() => refetch()} />
      ) : mensalidades.length === 0 ? (
        <EmptyState
          icon={<Wallet size={30} className="text-brand" />}
          title="Nenhuma mensalidade nesta competência"
          description={`Não há mensalidades geradas para ${formatCompetencia(comp)}.`}
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

type DespesaForm = z.infer<typeof despesaSchema>

/** Dialog com formulário de registro de despesa (RHF + zod). */
function RegistrarDespesaDialog() {
  const [open, setOpen] = useState(false)
  const registrar = useRegistrarDespesa()
  const { data: professores } = useProfessores()

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<DespesaForm>({
    resolver: zodResolver(despesaSchema),
    defaultValues: { descricao: '', categoria: '', valor: '', data: hojeISO(), professorId: '' },
  })

  const repasse = watch('categoria') === 'REPASSE_PROFESSOR'

  function handleOpenChange(o: boolean) {
    setOpen(o)
    if (!o) reset()
  }

  async function onSubmit(v: DespesaForm) {
    const payload: RegistrarDespesaPayload = {
      descricao: v.descricao.trim(),
      categoria: v.categoria as CategoriaDespesa,
      valor: Number(v.valor),
      data: v.data || undefined,
      professorId: v.categoria === 'REPASSE_PROFESSOR' ? v.professorId : undefined,
    }
    try {
      await registrar.mutateAsync(payload)
      toast.success('Despesa registrada.')
      setOpen(false)
      reset()
    } catch (e) {
      toast.error(mensagemErro(e))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="cta">
          <Plus size={18} weight="bold" />
          Registrar despesa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>Registrar despesa</DialogTitle>
            <DialogDescription>Lance uma saída do mês.</DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
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
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" loading={registrar.isPending}>
              Registrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DespesasTab({ comp }: { comp: string }) {
  const { data, isLoading, isError, refetch } = useDespesas(comp)
  const despesas = data ?? []
  const total = despesas.reduce((acc, d) => acc + d.valor, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[15px] text-ink-muted">Saídas registradas em {formatCompetencia(comp)}.</p>
        <RegistrarDespesaDialog />
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
              </TR>
            ))}
            <TR className="bg-canvas">
              <TD colSpan={3} className="font-semibold text-ink-muted">
                Total de despesas em {formatCompetencia(comp)}
              </TD>
              <TD className="text-right text-lg font-extrabold tabular text-brand">{formatBRL(total)}</TD>
            </TR>
          </TBody>
        </Table>
      )}
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
