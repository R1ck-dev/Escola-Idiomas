import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChalkboardTeacher, Info, Plus } from '@phosphor-icons/react'
import { useCadastrarProfessor, useProfessores } from '@/api/gestao'
import type { CadastrarProfessorPayload, Professor } from '@/types/api'
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
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { EmptyState, ErrorState, LoadingRows } from '@/components/ui/states'
import { toast } from '@/components/ui/toaster'
import { mensagemErro } from '@/lib/api'
import { statusUsuario } from '@/lib/status'

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const schema = z.object({
  nome: z.string().trim().min(3, 'Informe o nome completo'),
  email: z.string().trim().regex(emailRegex, 'E-mail inválido'),
  cpf: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, '').length === 11, 'CPF deve ter 11 dígitos'),
  rg: z.string(),
  telefone: z.string(),
  chavePix: z.string(),
  dadosBancarios: z.string(),
  idiomasHabilitados: z.string(),
})

type FormValues = z.infer<typeof schema>

const valoresIniciais: FormValues = {
  nome: '',
  email: '',
  cpf: '',
  rg: '',
  telefone: '',
  chavePix: '',
  dadosBancarios: '',
  idiomasHabilitados: '',
}

/** Converte string vazia em undefined (campos opcionais não vão no payload). */
function opcional(valor: string): string | undefined {
  const t = valor.trim()
  return t ? t : undefined
}

function LinhaProfessor({ professor }: { professor: Professor }) {
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
    </TR>
  )
}

export default function GestaoProfessoresPage() {
  const professores = useProfessores()
  const cadastrar = useCadastrarProfessor()
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: valoresIniciais })

  function handleOpenChange(next: boolean) {
    if (!next) reset(valoresIniciais)
    setOpen(next)
  }

  async function onSubmit(v: FormValues) {
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
    try {
      await cadastrar.mutateAsync(payload)
      toast.success('Professor cadastrado — ele receberá um e-mail para definir a senha.')
      setOpen(false)
      reset(valoresIniciais)
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
        <Button variant="cta" onClick={() => handleOpenChange(true)}>
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
              <Button variant="cta" onClick={() => handleOpenChange(true)}>
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
            </TR>
          </THead>
          <TBody>
            {lista.map((p) => (
              <LinhaProfessor key={p.id} professor={p} />
            ))}
          </TBody>
        </Table>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-xl">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex min-h-0 flex-1 flex-col">
            <DialogHeader>
              <DialogTitle>Cadastrar professor</DialogTitle>
              <DialogDescription>Ele receberá um e-mail para definir a senha.</DialogDescription>
            </DialogHeader>

            <DialogBody className="flex flex-col gap-4">
              <Field label="Nome completo" htmlFor="nome" required error={errors.nome?.message}>
                <Input id="nome" placeholder="Camila Rocha" invalid={!!errors.nome} {...register('nome')} />
              </Field>

              <Field label="E-mail" htmlFor="email" required error={errors.email?.message}>
                <Input
                  id="email"
                  type="email"
                  placeholder="camila.rocha@email.com"
                  invalid={!!errors.email}
                  {...register('email')}
                />
              </Field>

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
                htmlFor="idiomasHabilitados"
                hint="ex.: Inglês, Espanhol"
                error={errors.idiomasHabilitados?.message}
              >
                <Input id="idiomasHabilitados" placeholder="Inglês, Espanhol" {...register('idiomasHabilitados')} />
              </Field>

              <div className="flex items-start gap-2.5 rounded-xl bg-canvas px-3.5 py-3 text-[13px] leading-relaxed text-ink-muted">
                <Info size={16} className="mt-0.5 shrink-0 text-info" />
                Ao cadastrar, enviamos um e-mail para o professor definir a senha e acessar a área dele.
              </div>
            </DialogBody>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" variant="primary" loading={cadastrar.isPending}>
                Cadastrar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
