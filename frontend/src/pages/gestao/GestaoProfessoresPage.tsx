import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChalkboardTeacher, Info, PaperPlaneTilt, PencilSimple, Plus } from '@phosphor-icons/react'
import {
  useAtualizarProfessor,
  useCadastrarProfessor,
  useProfessores,
  useReenviarConviteProfessor,
} from '@/api/gestao'
import type { AtualizarProfessorPayload, CadastrarProfessorPayload, Professor } from '@/types/api'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
} from '@/components/ui/dialog'
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
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ToggleChips } from '@/components/ui/toggle-chips'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { EmptyState, ErrorState, LoadingRows } from '@/components/ui/states'
import { toast } from '@/components/ui/toaster'
import { mensagemErro } from '@/lib/api'
import { statusUsuario } from '@/lib/status'

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

// Campos comuns aos dois modos. CPF/RG só existem no cadastro (não fazem parte
// do payload de atualização), por isso ficam de fora do formulário em edição.
const camposComuns = {
  nome: z.string().trim().min(3, 'Informe o nome completo'),
  email: z.string().trim().regex(emailRegex, 'E-mail inválido'),
  rg: z.string(),
  telefone: z.string(),
  chavePix: z.string(),
  dadosBancarios: z.string(),
  idiomasHabilitados: z.string(),
}

const schemaCriar = z.object({
  ...camposComuns,
  cpf: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, '').length === 11, 'CPF deve ter 11 dígitos'),
})

// Na edição o CPF não é validado (campo oculto/não editável).
const schemaEditar = z.object({ ...camposComuns, cpf: z.string() })

type FormValues = z.infer<typeof schemaCriar>

function toDefaults(professor: Professor | null): FormValues {
  return {
    nome: professor?.nome ?? '',
    email: professor?.email ?? '',
    cpf: '',
    rg: '',
    telefone: professor?.telefone ?? '',
    chavePix: '',
    dadosBancarios: '',
    idiomasHabilitados: professor?.idiomasHabilitados ?? '',
  }
}

/** Converte string vazia em undefined (campos opcionais não vão no payload). */
function opcional(valor: string): string | undefined {
  const t = valor.trim()
  return t ? t : undefined
}

// Conjunto fixo de idiomas oferecido como chips (não há lista canônica no app).
const IDIOMAS_FIXOS = ['Inglês', 'Espanhol', 'Francês', 'Alemão', 'Italiano', 'Português']

/** "Inglês, Espanhol" → ['Inglês', 'Espanhol'] (sem vazios). */
function parseIdiomas(valor: string): string[] {
  return valor
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/** ['Inglês', 'Espanhol'] → "Inglês, Espanhol". */
function joinIdiomas(itens: string[]): string {
  return itens.join(', ')
}

// ---------- Formulário (cadastro / edição) ----------

function ProfessorForm({ professor, onDone }: { professor: Professor | null; onDone: () => void }) {
  const editando = professor != null
  const cadastrar = useCadastrarProfessor()
  const atualizar = useAtualizarProfessor()
  const salvando = cadastrar.isPending || atualizar.isPending

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(editando ? schemaEditar : schemaCriar),
    defaultValues: toDefaults(professor),
  })

  async function onSubmit(v: FormValues) {
    try {
      if (professor) {
        const payload: AtualizarProfessorPayload = {
          nome: v.nome.trim(),
          telefone: opcional(v.telefone),
          chavePix: opcional(v.chavePix),
          dadosBancarios: opcional(v.dadosBancarios),
          idiomasHabilitados: opcional(v.idiomasHabilitados),
        }
        await atualizar.mutateAsync({ id: professor.id, ...payload })
        toast.success('Dados do professor atualizados.')
      } else {
        const payload: CadastrarProfessorPayload = {
          nome: v.nome.trim(),
          email: v.email.trim(),
          cpf: v.cpf.trim(),
          rg: opcional(v.rg),
          telefone: opcional(v.telefone),
          chavePix: opcional(v.chavePix),
          dadosBancarios: opcional(v.dadosBancarios),
          idiomasHabilitados: opcional(v.idiomasHabilitados),
        }
        await cadastrar.mutateAsync(payload)
        toast.success('Professor cadastrado — ele receberá um e-mail para definir a senha.')
      }
      onDone()
    } catch (e) {
      toast.error(mensagemErro(e))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex min-h-0 flex-1 flex-col">
      <SheetHeader>
        <SheetTitle>{editando ? 'Editar professor' : 'Cadastrar professor'}</SheetTitle>
        <SheetDescription>
          {editando
            ? 'Atualize os dados de contato e pagamento. O e-mail de acesso não pode ser alterado.'
            : 'Ele receberá um e-mail para definir a senha.'}
        </SheetDescription>
      </SheetHeader>

      <SheetBody className="flex flex-col gap-4">
        <Field label="Nome completo" htmlFor="nome" required error={errors.nome?.message}>
          <Input id="nome" placeholder="Camila Rocha" invalid={!!errors.nome} {...register('nome')} />
        </Field>

        <Field
          label="E-mail"
          htmlFor="email"
          required={!editando}
          hint={editando ? 'O e-mail de acesso não pode ser alterado.' : undefined}
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            placeholder="camila.rocha@email.com"
            invalid={!!errors.email}
            readOnly={editando}
            aria-disabled={editando || undefined}
            className={editando ? 'cursor-not-allowed bg-surface-2 text-ink-muted' : undefined}
            {...register('email')}
          />
        </Field>

        {!editando && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="CPF" htmlFor="cpf" required error={errors.cpf?.message}>
              <Input
                id="cpf"
                inputMode="numeric"
                placeholder="123.456.789-00"
                invalid={!!errors.cpf}
                {...register('cpf')}
              />
            </Field>
            <Field label="RG" htmlFor="rg" hint="opcional" error={errors.rg?.message}>
              <Input id="rg" placeholder="00.000.000-0" {...register('rg')} />
            </Field>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Telefone" htmlFor="telefone" error={errors.telefone?.message}>
            <Input id="telefone" inputMode="tel" placeholder="(11) 98765-4321" {...register('telefone')} />
          </Field>
          <Field label="Chave PIX" htmlFor="chavePix" error={errors.chavePix?.message}>
            <Input id="chavePix" placeholder="e-mail, CPF ou telefone" {...register('chavePix')} />
          </Field>
        </div>

        <Field
          label="Dados bancários"
          htmlFor="dadosBancarios"
          hint="Banco, agência e conta — opcional"
          error={errors.dadosBancarios?.message}
        >
          <Textarea
            id="dadosBancarios"
            rows={2}
            placeholder="Banco 000 · Ag. 0000 · CC 00000-0"
            {...register('dadosBancarios')}
          />
        </Field>

        <Field
          label="Idiomas habilitados"
          hint="Selecione um ou mais idiomas."
          error={errors.idiomasHabilitados?.message}
        >
          <Controller
            control={control}
            name="idiomasHabilitados"
            render={({ field }) => {
              const selecionados = parseIdiomas(field.value)
              // Preserva idiomas fora da lista fixa (ex.: valor legado na edição).
              const extras = selecionados.filter((i) => !IDIOMAS_FIXOS.includes(i))
              const options = [...IDIOMAS_FIXOS, ...extras].map((i) => ({ value: i, label: i }))
              return (
                <ToggleChips
                  aria-label="Idiomas habilitados"
                  options={options}
                  value={selecionados}
                  onChange={(next) => field.onChange(joinIdiomas(next))}
                />
              )
            }}
          />
        </Field>

        <div className="flex items-start gap-2.5 rounded-xl bg-canvas px-3.5 py-3 text-[13px] leading-relaxed text-ink-muted">
          <Info size={16} className="mt-0.5 shrink-0 text-info" />
          {editando
            ? 'Os campos de PIX e dados bancários só são alterados se você preenchê-los.'
            : 'Ao cadastrar, enviamos um e-mail para o professor definir a senha e acessar a área dele.'}
        </div>
      </SheetBody>

      <SheetFooter>
        <SheetClose asChild>
          <Button type="button" variant="secondary">
            Cancelar
          </Button>
        </SheetClose>
        <Button type="submit" variant="primary" loading={salvando}>
          {editando ? 'Salvar alterações' : 'Cadastrar'}
        </Button>
      </SheetFooter>
    </form>
  )
}

// ---------- Linha da tabela ----------

function LinhaProfessor({
  professor,
  onEditar,
  onReenviar,
}: {
  professor: Professor
  onEditar: () => void
  onReenviar: () => void
}) {
  const s = statusUsuario[professor.status]
  return (
    <TR className="transition-colors even:bg-[#FBFCFD] hover:bg-navy-50/50">
      <TD>
        <div className="flex items-center gap-3">
          <Avatar nome={professor.nome} className="size-9 text-[13px]" />
          <div className="min-w-0">
            <div className="font-semibold text-ink">{professor.nome}</div>
            <div className="truncate text-[13px] text-ink-subtle">{professor.email}</div>
          </div>
        </div>
      </TD>
      <TD className="whitespace-nowrap text-[14px] tabular text-ink-muted">{professor.telefone || '—'}</TD>
      <TD className="text-[14px] text-ink-muted">{professor.idiomasHabilitados || '—'}</TD>
      <TD>
        <Badge tone={s.tone}>{s.label}</Badge>
      </TD>
      <TD>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="row" onClick={onEditar}>
            <PencilSimple size={16} weight="bold" />
            Editar
          </Button>
          <Button variant="ghost" size="row" onClick={onReenviar}>
            <PaperPlaneTilt size={16} weight="bold" />
            Reenviar convite
          </Button>
        </div>
      </TD>
    </TR>
  )
}

// ---------- Página ----------

export default function GestaoProfessoresPage() {
  const professores = useProfessores()
  const reenviar = useReenviarConviteProfessor()

  const [dialogAberto, setDialogAberto] = useState(false)
  const [editando, setEditando] = useState<Professor | null>(null)
  const [reenviarAlvo, setReenviarAlvo] = useState<Professor | null>(null)

  function abrirNovo() {
    setEditando(null)
    setDialogAberto(true)
  }

  function abrirEdicao(professor: Professor) {
    setEditando(professor)
    setDialogAberto(true)
  }

  async function confirmarReenvio() {
    if (!reenviarAlvo) return
    try {
      const { mensagem } = await reenviar.mutateAsync(reenviarAlvo.id)
      toast.success(mensagem)
      setReenviarAlvo(null)
    } catch (e) {
      toast.error(mensagemErro(e))
    }
  }

  const lista = professores.data
  const total = lista?.length
  const subtitle =
    total != null
      ? `${total} ${total === 1 ? 'professor cadastrado' : 'professores cadastrados'}`
      : 'Professores da escola e idiomas que lecionam.'

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-[-.015em] text-ink">Professores</h1>
          <p className="mt-1 text-ink-muted">{subtitle}</p>
        </div>
        <Button variant="cta" onClick={abrirNovo}>
          <Plus size={18} weight="bold" />
          Cadastrar professor
        </Button>
      </header>

      {professores.isLoading ? (
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(16,24,40,.04)]">
          <LoadingRows rows={5} />
        </div>
      ) : professores.isError ? (
        <ErrorState
          title="Não foi possível carregar os professores"
          onRetry={() => professores.refetch()}
        />
      ) : !lista || lista.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface py-6 shadow-[0_1px_2px_rgba(16,24,40,.04)]">
          <EmptyState
            icon={<ChalkboardTeacher weight="fill" size={30} />}
            title="Nenhum professor cadastrado ainda"
            description="Cadastre o primeiro professor da escola para montar as turmas."
            action={
              <Button variant="cta" onClick={abrirNovo}>
                <Plus size={18} weight="bold" />
                Cadastrar professor
              </Button>
            }
          />
        </div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Nome</TH>
              <TH>Telefone</TH>
              <TH>Idiomas</TH>
              <TH>Status</TH>
              <TH className="text-right">Ações</TH>
            </TR>
          </THead>
          <TBody>
            {lista.map((p) => (
              <LinhaProfessor
                key={p.id}
                professor={p}
                onEditar={() => abrirEdicao(p)}
                onReenviar={() => setReenviarAlvo(p)}
              />
            ))}
          </TBody>
        </Table>
      )}

      <Sheet open={dialogAberto} onOpenChange={setDialogAberto}>
        <SheetContent>
          {dialogAberto && (
            <ProfessorForm
              key={editando?.id ?? 'novo'}
              professor={editando}
              onDone={() => setDialogAberto(false)}
            />
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={!!reenviarAlvo} onOpenChange={(o) => !o && setReenviarAlvo(null)}>
        {reenviarAlvo && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reenviar convite de 1º acesso?</DialogTitle>
              <DialogDescription>
                Vamos reenviar o e-mail de definição de senha para {reenviarAlvo.nome} ({reenviarAlvo.email}).
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              <div className="flex items-start gap-2.5 rounded-xl bg-canvas px-3.5 py-3 text-[13px] leading-relaxed text-ink-muted">
                <Info size={16} className="mt-0.5 shrink-0 text-info" />
                Útil para professores que ainda não definiram a senha de acesso.
              </div>
            </DialogBody>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancelar
                </Button>
              </DialogClose>
              <Button variant="primary" loading={reenviar.isPending} onClick={confirmarReenvio}>
                Reenviar convite
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
