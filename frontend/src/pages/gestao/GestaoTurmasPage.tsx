import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Books, Clock, Info, LinkSimple, PencilSimple, Plus, User } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { toast } from '@/components/ui/toaster'
import { useAtualizarTurma, useCriarTurma, useProfessores, useTurmasGestao } from '@/api/gestao'
import { formatBRL, formatHora } from '@/lib/format'
import { mensagemErro } from '@/lib/api'
import type { CriarTurmaPayload, TurmaGestao } from '@/types/api'

// ---------- Helpers ----------

/** Monta "SEG,QUA · 19:00–20:30" a partir dos dados da turma. */
function horarioTexto(t: TurmaGestao): string {
  const partes: string[] = []
  if (t.diasSemana) partes.push(t.diasSemana)
  const ini = formatHora(t.horaInicio)
  const fim = formatHora(t.horaFim)
  if (ini && fim) partes.push(`${ini}–${fim}`)
  else if (ini) partes.push(ini)
  return partes.join(' · ') || 'Horário a definir'
}

/** Copia o link público de matrícula da turma para a área de transferência. */
async function copiarLinkMatricula(turmaId: string) {
  const url = `${window.location.origin}/matricula?turmaId=${turmaId}`
  try {
    await navigator.clipboard.writeText(url)
    toast.success('Link de matrícula copiado para a área de transferência.')
  } catch {
    toast.error(`Não foi possível copiar automaticamente. Link: ${url}`)
  }
}

// ---------- Formulário (schema + zod) ----------

const schema = z
  .object({
    professorId: z.string().min(1, 'Selecione o professor.'),
    nome: z.string().trim().min(1, 'Informe o nome da turma.'),
    idioma: z.string().trim().min(1, 'Informe o idioma.'),
    nivel: z.string(),
    diasSemana: z.string(),
    horaInicio: z.string(),
    horaFim: z.string(),
    valorMensalidade: z
      .string()
      .min(1, 'Informe o valor da mensalidade.')
      .refine((v) => {
        const n = Number(v.replace(',', '.'))
        return Number.isFinite(n) && n > 0
      }, 'Informe um valor válido.'),
    lotacaoMaxima: z.string(),
    ativa: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.horaInicio && v.horaFim && v.horaFim <= v.horaInicio) {
      ctx.addIssue({ code: 'custom', path: ['horaFim'], message: 'O fim deve ser depois do início.' })
    }
    if (v.lotacaoMaxima.trim()) {
      const n = Number(v.lotacaoMaxima)
      if (!Number.isInteger(n) || n < 1) {
        ctx.addIssue({ code: 'custom', path: ['lotacaoMaxima'], message: 'Use um número inteiro ≥ 1.' })
      }
    }
  })

type FormValues = z.infer<typeof schema>

function toDefaults(turma: TurmaGestao | null): FormValues {
  return {
    professorId: turma?.professorId ?? '',
    nome: turma?.nome ?? '',
    idioma: turma?.idioma ?? '',
    nivel: turma?.nivel ?? '',
    diasSemana: turma?.diasSemana ?? '',
    horaInicio: formatHora(turma?.horaInicio),
    horaFim: formatHora(turma?.horaFim),
    valorMensalidade: turma ? String(turma.valorMensalidade) : '',
    lotacaoMaxima: turma ? String(turma.lotacaoMaxima) : '',
    ativa: turma?.ativa ?? true,
  }
}

function TurmaForm({ turma, onDone }: { turma: TurmaGestao | null; onDone: () => void }) {
  const editando = turma != null
  const { data: professores } = useProfessores()
  const criar = useCriarTurma()
  const atualizar = useAtualizarTurma()
  const salvando = criar.isPending || atualizar.isPending

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toDefaults(turma) })

  async function onSubmit(v: FormValues) {
    const base: CriarTurmaPayload = {
      professorId: v.professorId,
      nome: v.nome.trim(),
      idioma: v.idioma.trim(),
      nivel: v.nivel.trim() || undefined,
      diasSemana: v.diasSemana.trim() || undefined,
      horaInicio: v.horaInicio || undefined,
      horaFim: v.horaFim || undefined,
      valorMensalidade: Number(v.valorMensalidade.replace(',', '.')),
      lotacaoMaxima: v.lotacaoMaxima.trim() ? Number(v.lotacaoMaxima) : undefined,
    }
    try {
      if (turma) {
        await atualizar.mutateAsync({ id: turma.id, ...base, ativa: v.ativa })
        toast.success('Turma atualizada.')
      } else {
        await criar.mutateAsync(base)
        toast.success('Turma criada.')
      }
      onDone()
    } catch (e) {
      toast.error(mensagemErro(e))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
      <DialogHeader>
        <DialogTitle>{editando ? 'Editar turma' : 'Nova turma'}</DialogTitle>
        <DialogDescription>Preencha os dados da turma.</DialogDescription>
      </DialogHeader>

      <DialogBody className="flex flex-col gap-4">
        <Field label="Professor" htmlFor="professorId" required error={errors.professorId?.message}>
          <Controller
            control={control}
            name="professorId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="professorId" invalid={!!errors.professorId}>
                  <SelectValue placeholder="Selecione o professor" />
                </SelectTrigger>
                <SelectContent>
                  {professores?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field label="Nome da turma" htmlFor="nome" required error={errors.nome?.message}>
          <Input
            id="nome"
            placeholder="Inglês B2 — Noite"
            invalid={!!errors.nome}
            {...register('nome')}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Idioma" htmlFor="idioma" required error={errors.idioma?.message}>
            <Input id="idioma" placeholder="Inglês" invalid={!!errors.idioma} {...register('idioma')} />
          </Field>
          <Field label="Nível" htmlFor="nivel" error={errors.nivel?.message}>
            <Input id="nivel" placeholder="B2" invalid={!!errors.nivel} {...register('nivel')} />
          </Field>
        </div>

        <Field label="Dias da semana" htmlFor="diasSemana" hint="ex.: SEG,QUA" error={errors.diasSemana?.message}>
          <Input
            id="diasSemana"
            placeholder="SEG,QUA"
            invalid={!!errors.diasSemana}
            {...register('diasSemana')}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Início" htmlFor="horaInicio" error={errors.horaInicio?.message}>
            <Input id="horaInicio" type="time" className="tabular" {...register('horaInicio')} />
          </Field>
          <Field label="Fim" htmlFor="horaFim" error={errors.horaFim?.message}>
            <Input
              id="horaFim"
              type="time"
              className="tabular"
              invalid={!!errors.horaFim}
              {...register('horaFim')}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Mensalidade"
            htmlFor="valorMensalidade"
            required
            error={errors.valorMensalidade?.message}
          >
            <Input
              id="valorMensalidade"
              type="number"
              step="0.01"
              min="0"
              placeholder="320.00"
              className="tabular"
              invalid={!!errors.valorMensalidade}
              {...register('valorMensalidade')}
            />
          </Field>
          <Field
            label="Lotação"
            htmlFor="lotacaoMaxima"
            hint="Padrão: 12"
            error={errors.lotacaoMaxima?.message}
          >
            <Input
              id="lotacaoMaxima"
              type="number"
              min="1"
              placeholder="12"
              className="tabular"
              invalid={!!errors.lotacaoMaxima}
              {...register('lotacaoMaxima')}
            />
          </Field>
        </div>

        {editando && (
          <>
            <div className="flex items-center justify-between rounded-xl border border-line bg-surface-2 px-4 py-3">
              <div>
                <span className="block text-sm font-semibold text-ink">Turma ativa</span>
                <span className="text-[13px] text-ink-muted">Turmas inativas não recebem novas matrículas.</span>
              </div>
              <Controller
                control={control}
                name="ativa"
                render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
              />
            </div>
            <div className="flex items-start gap-2 rounded-xl bg-surface-2 px-4 py-3 text-[13px] leading-relaxed text-ink-muted">
              <Info size={16} weight="fill" className="mt-px shrink-0 text-info" />
              Alterar o valor vale apenas para mensalidades futuras.
            </div>
          </>
        )}
      </DialogBody>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" loading={salvando}>
          Salvar turma
        </Button>
      </DialogFooter>
    </form>
  )
}

// ---------- Card de turma ----------

function TurmaCard({ turma, onEditar }: { turma: TurmaGestao; onEditar: () => void }) {
  const cheia = turma.ocupacaoAtual >= turma.lotacaoMaxima
  const pct =
    turma.lotacaoMaxima > 0
      ? Math.min(100, Math.round((turma.ocupacaoAtual / turma.lotacaoMaxima) * 100))
      : 0

  return (
    <Card
      className="flex flex-col p-5"
      style={cheia ? { borderColor: '#F0D3AE' } : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-[16px] font-bold tracking-[-.01em] text-ink">{turma.nome}</h3>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          {cheia ? (
            <Badge tone="danger">Cheia</Badge>
          ) : (
            <Badge tone="neutral" dot={false} className="tabular">
              {turma.ocupacaoAtual}/{turma.lotacaoMaxima}
            </Badge>
          )}
          {!turma.ativa && (
            <Badge tone="neutral" dot={false}>
              Inativa
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <Badge tone="info" dot={false}>
          {turma.idioma}
        </Badge>
        {turma.nivel && (
          <Badge tone="neutralAlt" dot={false}>
            {turma.nivel}
          </Badge>
        )}
      </div>

      <div className="mt-3.5 flex items-center gap-2 text-[14px] text-ink-muted">
        <User size={16} className="shrink-0 text-ink-subtle" />
        <span className="min-w-0 truncate">{turma.professorNome ?? 'Sem professor'}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-[14px] text-ink-muted">
        <Clock size={16} className="shrink-0 text-ink-subtle" />
        <span className="min-w-0 truncate">{horarioTexto(turma)}</span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4 border-t border-[#F0F2F5] pt-4">
        <div>
          <div className="text-[12px] text-ink-subtle">Mensalidade</div>
          <div className="text-[17px] font-bold tabular text-brand">{formatBRL(turma.valorMensalidade)}</div>
        </div>
        <div className="min-w-[120px]">
          <div className="mb-1.5 flex items-center justify-between text-[12px] text-ink-subtle">
            <span>Ocupação</span>
            <span className="tabular text-ink-muted">
              {turma.ocupacaoAtual}/{turma.lotacaoMaxima}
            </span>
          </div>
          <div className="h-[7px] overflow-hidden rounded-full bg-[#EEF0F3]">
            <div
              className="h-full rounded-full transition-[width]"
              style={{ width: `${pct}%`, backgroundColor: cheia ? '#E0A400' : '#1E9E5A' }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {turma.ativa && (
          <Button
            variant="secondary"
            size="row"
            className="flex-1"
            onClick={() => copiarLinkMatricula(turma.id)}
          >
            <LinkSimple size={16} />
            Copiar link
          </Button>
        )}
        <Button variant="secondary" size="row" className="flex-1" onClick={onEditar}>
          <PencilSimple size={16} />
          Editar
        </Button>
      </div>
    </Card>
  )
}

// ---------- Página ----------

export default function GestaoTurmasPage() {
  const { data: turmas, isLoading, isError, refetch } = useTurmasGestao()
  const [dialogAberto, setDialogAberto] = useState(false)
  const [editando, setEditando] = useState<TurmaGestao | null>(null)

  function abrirNova() {
    setEditando(null)
    setDialogAberto(true)
  }

  function abrirEdicao(turma: TurmaGestao) {
    setEditando(turma)
    setDialogAberto(true)
  }

  const total = turmas?.length ?? 0
  const subtitulo =
    total > 0
      ? `${total} turma${total === 1 ? '' : 's'} · gerencie horários e valores`
      : 'Gerencie as turmas, horários e valores.'

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-[-.015em] text-ink">Turmas</h1>
          <p className="mt-1 text-[15px] text-ink-muted">{subtitulo}</p>
        </div>
        <Button variant="cta" onClick={abrirNova}>
          <Plus size={18} weight="bold" />
          Nova turma
        </Button>
      </header>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Não foi possível carregar as turmas"
          description="Tente novamente em instantes."
          onRetry={() => refetch()}
        />
      ) : total === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={<Books size={30} className="text-brand" />}
            title="Nenhuma turma cadastrada ainda"
            description="Crie a primeira turma para começar a matricular alunos, definir horários e valores."
            action={
              <Button variant="cta" onClick={abrirNova}>
                <Plus size={18} weight="bold" />
                Nova turma
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {turmas!.map((turma) => (
            <TurmaCard key={turma.id} turma={turma} onEditar={() => abrirEdicao(turma)} />
          ))}
        </div>
      )}

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent>
          {dialogAberto && (
            <TurmaForm
              key={editando?.id ?? 'nova'}
              turma={editando}
              onDone={() => setDialogAberto(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
