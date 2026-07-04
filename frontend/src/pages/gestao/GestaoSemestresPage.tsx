import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarBlank, CalendarCheck, Info, Plus } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { BadgeTone } from '@/components/ui/badge'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
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
import { EmptyState, ErrorState, LoadingRows } from '@/components/ui/states'
import { toast } from '@/components/ui/toaster'
import { formatDate } from '@/lib/format'
import { mensagemErro } from '@/lib/api'
import { useCriarSemestre, useSemestres } from '@/api/gestao'
import type { Semestre } from '@/types/api'

/** Data de hoje (fuso local) em "yyyy-MM-dd" — comparável lexicograficamente com dataInicio/dataFim. */
function hojeISO(): string {
  const agora = new Date()
  const local = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

type SituacaoSemestre = 'VIGENTE' | 'ENCERRADO' | 'AGENDADO'

/** Vigente/Encerrado/Agendado é derivado no front (não vem no DTO). */
function situacaoDoSemestre(s: Semestre, hoje: string): SituacaoSemestre {
  if (hoje < s.dataInicio) return 'AGENDADO'
  if (hoje > s.dataFim) return 'ENCERRADO'
  return 'VIGENTE'
}

const situacaoMeta: Record<SituacaoSemestre, { label: string; tone: BadgeTone; iconTint: string }> = {
  VIGENTE: { label: 'Vigente', tone: 'success', iconTint: 'bg-navy-50 text-brand' },
  ENCERRADO: { label: 'Encerrado', tone: 'neutral', iconTint: 'bg-[#EEF0F3] text-ink-subtle' },
  AGENDADO: { label: 'Agendado', tone: 'info', iconTint: 'bg-info-bg text-info' },
}

function SemestreCard({ semestre, hoje }: { semestre: Semestre; hoje: string }) {
  const situacao = situacaoDoSemestre(semestre, hoje)
  const meta = situacaoMeta[situacao]
  const Icone = situacao === 'VIGENTE' ? CalendarCheck : CalendarBlank

  return (
    <Card className="flex items-center gap-4 p-5">
      <div className={`grid size-12 shrink-0 place-items-center rounded-xl ${meta.iconTint}`}>
        <Icone size={22} weight={situacao === 'VIGENTE' ? 'fill' : 'regular'} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[17px] font-bold text-ink tabular">{semestre.referencia}</span>
          <Badge tone={meta.tone}>{meta.label}</Badge>
        </div>
        <div className="mt-1 text-sm text-ink-muted tabular">
          {formatDate(semestre.dataInicio)} a {formatDate(semestre.dataFim)}
        </div>
      </div>
    </Card>
  )
}

const schema = z
  .object({
    referencia: z
      .string()
      .trim()
      .regex(/^\d{4}-\d+$/, 'Use o formato aaaa-N (ex.: 2026-2).'),
    dataInicio: z.string().min(1, 'Informe a data de início.'),
    dataFim: z.string().min(1, 'Informe a data de fim.'),
  })
  .refine((v) => !v.dataInicio || !v.dataFim || v.dataFim > v.dataInicio, {
    path: ['dataFim'],
    message: 'A data de fim deve ser depois do início.',
  })

type FormValues = z.infer<typeof schema>

const valoresIniciais: FormValues = { referencia: '', dataInicio: '', dataFim: '' }

function NovoSemestreDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const criar = useCriarSemestre()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: valoresIniciais })

  // Zera o formulário toda vez que o painel abre.
  useEffect(() => {
    if (open) reset(valoresIniciais)
  }, [open, reset])

  async function onSubmit(v: FormValues) {
    try {
      await criar.mutateAsync({
        referencia: v.referencia.trim(),
        dataInicio: v.dataInicio,
        dataFim: v.dataFim,
      })
      toast.success('Semestre criado.')
      onOpenChange(false)
    } catch (e) {
      toast.error(mensagemErro(e))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo semestre</DialogTitle>
          <DialogDescription>Defina o período letivo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogBody className="flex flex-col gap-4">
            <Field label="Referência" htmlFor="referencia" required hint="ex.: 2026-2" error={errors.referencia?.message}>
              <Input
                id="referencia"
                placeholder="2026-2"
                className="tabular"
                invalid={!!errors.referencia}
                {...register('referencia')}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Data de início" htmlFor="dataInicio" required error={errors.dataInicio?.message}>
                <Input id="dataInicio" type="date" className="tabular" invalid={!!errors.dataInicio} {...register('dataInicio')} />
              </Field>
              <Field label="Data de fim" htmlFor="dataFim" required error={errors.dataFim?.message}>
                <Input id="dataFim" type="date" className="tabular" invalid={!!errors.dataFim} {...register('dataFim')} />
              </Field>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl bg-surface-2 px-4 py-3 text-[13px] leading-relaxed text-ink-muted">
              <Info weight="fill" size={16} className="mt-0.5 shrink-0 text-info" />
              <span>Chamadas, notas e boletins ficam vinculados a este semestre.</span>
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" variant="primary" loading={criar.isPending}>
              Criar semestre
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function GestaoSemestresPage() {
  const [open, setOpen] = useState(false)
  const { data: semestres, isLoading, isError, refetch } = useSemestres()

  const hoje = hojeISO()
  const ordenados = useMemo(
    () => [...(semestres ?? [])].sort((a, b) => b.dataInicio.localeCompare(a.dataInicio)),
    [semestres],
  )

  const total = semestres?.length ?? 0
  const subtitulo = semestres
    ? `${total} ${total === 1 ? 'semestre cadastrado' : 'semestres cadastrados'}`
    : 'Períodos letivos da escola'

  return (
    <>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-[-.015em] text-ink">Semestres</h1>
          <p className="mt-1 text-[15px] text-ink-muted">{subtitulo}</p>
        </div>
        <Button variant="cta" onClick={() => setOpen(true)}>
          <Plus size={18} weight="bold" />
          Novo semestre
        </Button>
      </header>

      <div className="max-w-[720px]">
        <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-line bg-surface-2 px-4 py-3 text-[14px] text-ink-muted">
          <Info weight="fill" size={18} className="mt-0.5 shrink-0 text-info" />
          <span>O semestre é a base para chamada, notas e boletim.</span>
        </div>

        {isLoading ? (
          <LoadingRows rows={3} />
        ) : isError ? (
          <ErrorState title="Não foi possível carregar os semestres" onRetry={() => refetch()} />
        ) : ordenados.length === 0 ? (
          <Card className="py-4">
            <EmptyState
              icon={<CalendarBlank size={30} className="text-brand" />}
              title="Nenhum semestre cadastrado ainda"
              description="Crie o primeiro para começar as chamadas e notas."
              action={
                <Button variant="cta" onClick={() => setOpen(true)}>
                  <Plus size={18} weight="bold" />
                  Novo semestre
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="flex flex-col gap-3.5">
            {ordenados.map((s) => (
              <SemestreCard key={s.id} semestre={s} hoje={hoje} />
            ))}
          </div>
        )}
      </div>

      <NovoSemestreDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
