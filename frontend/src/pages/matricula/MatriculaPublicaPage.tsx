import { useState } from 'react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, XCircle } from '@phosphor-icons/react'
import { Logo } from '@/components/Logo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/states'
import { toast } from '@/components/ui/toaster'
import { mensagemErro } from '@/lib/api'
import { solicitarMatricula } from '@/api/matricula'
import type { SolicitarMatriculaPayload } from '@/types/api'

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
const telRegex = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/
const dataRegex = /^\d{2}\/\d{2}\/\d{4}$/
const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

function calcularIdade(valor: string): number | null {
  const m = dataRegex.exec(valor)
  if (!m) return null
  const [dia, mes, ano] = valor.split('/').map(Number)
  const d = new Date(ano, mes - 1, dia)
  if (d.getFullYear() !== ano || d.getMonth() !== mes - 1 || d.getDate() !== dia) return null
  const hoje = new Date()
  let idade = hoje.getFullYear() - ano
  const passou = hoje.getMonth() > mes - 1 || (hoje.getMonth() === mes - 1 && hoje.getDate() >= dia)
  if (!passou) idade--
  return idade >= 0 && idade <= 120 ? idade : null
}

function paraISO(valor: string): string {
  const [dia, mes, ano] = valor.split('/')
  return `${ano}-${mes}-${dia}`
}

const schema = z
  .object({
    nome: z.string().min(3, 'Informe o nome completo'),
    dataNascimento: z
      .string()
      .regex(dataRegex, 'Use o formato dd/mm/aaaa')
      .refine((v) => calcularIdade(v) !== null, 'Data inválida'),
    email: z.string().regex(emailRegex, 'E-mail inválido'),
    telefone: z.string().regex(telRegex, 'Telefone inválido').or(z.literal('')),
    cpf: z.string().regex(cpfRegex, 'CPF inválido (000.000.000-00)'),
    rg: z.string(),
    endereco: z.string(),
    observacoes: z.string().max(500, 'Máximo de 500 caracteres'),
    responsavelNome: z.string(),
    responsavelCpf: z.string(),
    responsavelTelefone: z.string(),
    responsavelEmail: z.string(),
  })
  .superRefine((v, ctx) => {
    const idade = calcularIdade(v.dataNascimento)
    const menor = idade !== null && idade < 18
    if (menor) {
      if (v.responsavelNome.trim().length < 3)
        ctx.addIssue({ code: 'custom', path: ['responsavelNome'], message: 'Informe o nome do responsável' })
      if (!cpfRegex.test(v.responsavelCpf))
        ctx.addIssue({ code: 'custom', path: ['responsavelCpf'], message: 'CPF inválido (000.000.000-00)' })
    }
    if (v.responsavelTelefone && !telRegex.test(v.responsavelTelefone))
      ctx.addIssue({ code: 'custom', path: ['responsavelTelefone'], message: 'Telefone inválido' })
    if (v.responsavelEmail && !emailRegex.test(v.responsavelEmail))
      ctx.addIssue({ code: 'custom', path: ['responsavelEmail'], message: 'E-mail inválido' })
  })

type FormValues = z.infer<typeof schema>

const valoresIniciais: FormValues = {
  nome: '',
  dataNascimento: '',
  email: '',
  telefone: '',
  cpf: '',
  rg: '',
  endereco: '',
  observacoes: '',
  responsavelNome: '',
  responsavelCpf: '',
  responsavelTelefone: '',
  responsavelEmail: '',
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-ink-muted">{children}</p>
}

function Passo({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-navy-50 text-[13px] font-bold tabular text-brand">
        {n}
      </span>
      <span className="pt-0.5 text-[15px] text-ink">{children}</span>
    </li>
  )
}

export default function MatriculaPublicaPage() {
  const [searchParams] = useSearchParams()
  const turmaId = searchParams.get('turmaId')
  const [enviado, setEnviado] = useState(false)
  const [erroServidor, setErroServidor] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: valoresIniciais })

  const idade = calcularIdade(watch('dataNascimento'))
  const menor = idade !== null && idade < 18

  async function onSubmit(v: FormValues) {
    if (!turmaId) return
    setErroServidor(null)
    const payload: SolicitarMatriculaPayload = {
      turmaId,
      aluno: {
        nome: v.nome.trim(),
        email: v.email.trim(),
        dataNascimento: paraISO(v.dataNascimento),
        cpf: v.cpf,
        rg: v.rg.trim() || undefined,
        telefone: v.telefone || undefined,
        endereco: v.endereco.trim() || undefined,
        observacoes: v.observacoes.trim() || undefined,
      },
      responsavel: menor
        ? {
            nome: v.responsavelNome.trim(),
            cpf: v.responsavelCpf,
            telefone: v.responsavelTelefone || undefined,
            email: v.responsavelEmail.trim() || undefined,
          }
        : undefined,
    }
    try {
      await solicitarMatricula(payload)
      setEnviado(true)
    } catch (e) {
      const msg = mensagemErro(e)
      setErroServidor(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto flex min-h-screen w-full max-w-[760px] flex-col items-center px-5 py-10">
        <Logo size="md" className="mb-8" />

        {!turmaId ? (
          <Card className="w-full max-w-[560px]">
            <CardContent>
              <EmptyState
                icon={<XCircle weight="fill" size={30} className="text-danger" />}
                tintClass="bg-danger-bg"
                title="Link de matrícula inválido"
                description="Este link não indica a turma desejada. Peça à escola um novo link de matrícula para continuar."
              />
            </CardContent>
          </Card>
        ) : enviado ? (
          <Card className="w-full max-w-[560px]">
            <CardContent className="flex flex-col items-center text-center">
              <div className="grid size-16 place-items-center rounded-full bg-success-bg">
                <CheckCircle weight="fill" size={34} className="text-success" />
              </div>
              <h1 className="mt-5 text-[26px] font-extrabold tracking-[-.02em] text-ink">
                Recebemos sua solicitação!
              </h1>
              <p className="mt-3 max-w-[420px] text-[15px] leading-relaxed text-ink-muted">
                A escola vai avaliar o seu pedido de matrícula e você receberá um e-mail com a resposta.
              </p>

              <ol className="mt-7 flex w-full max-w-[380px] flex-col gap-4 text-left">
                <Passo n={1}>A escola avalia o seu pedido.</Passo>
                <Passo n={2}>Você recebe um e-mail com a resposta.</Passo>
                <Passo n={3}>Se aprovado, você cria sua senha e acessa sua área.</Passo>
              </ol>

              <p className="mt-8 text-[13px] text-ink-subtle">Dúvidas? Fale com a secretaria da escola.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-[26px] font-extrabold tracking-[-.02em] text-ink">Solicitar matrícula</h1>
              <p className="mt-2 text-[15px] text-ink-muted">
                Preencha os dados do aluno. É rápido e a escola responde por e-mail.
              </p>
            </div>

            <Card className="w-full">
              <CardHeader>
                <CardTitle>Dados da matrícula</CardTitle>
                <CardDescription>Os campos marcados com * são obrigatórios.</CardDescription>
              </CardHeader>
              <CardContent>
                {erroServidor && (
                  <div className="mb-6 flex items-start gap-3 rounded border border-danger/30 bg-danger-bg px-4 py-3 text-[14px] text-danger-dark">
                    <XCircle weight="fill" size={20} className="mt-0.5 shrink-0 text-danger" />
                    <span>{erroServidor}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8" noValidate>
                  <section className="flex flex-col gap-4">
                    <SectionLabel>Dados do aluno</SectionLabel>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field
                        className="sm:col-span-2"
                        label="Nome completo"
                        htmlFor="nome"
                        required
                        error={errors.nome?.message}
                      >
                        <Input
                          id="nome"
                          placeholder="Beatriz Lima Andrade"
                          invalid={!!errors.nome}
                          {...register('nome')}
                        />
                      </Field>

                      <Field
                        label="Data de nascimento"
                        htmlFor="dataNascimento"
                        required
                        hint="dd/mm/aaaa"
                        error={errors.dataNascimento?.message}
                      >
                        <Input
                          id="dataNascimento"
                          inputMode="numeric"
                          placeholder="12/09/2010"
                          invalid={!!errors.dataNascimento}
                          {...register('dataNascimento')}
                        />
                      </Field>

                      <Field label="E-mail" htmlFor="email" required error={errors.email?.message}>
                        <Input
                          id="email"
                          type="email"
                          placeholder="beatriz.andrade@email.com"
                          invalid={!!errors.email}
                          {...register('email')}
                        />
                      </Field>

                      <Field label="CPF" htmlFor="cpf" required error={errors.cpf?.message}>
                        <Input
                          id="cpf"
                          inputMode="numeric"
                          placeholder="123.456.789-00"
                          invalid={!!errors.cpf}
                          {...register('cpf')}
                        />
                      </Field>

                      <Field label="Telefone" htmlFor="telefone" error={errors.telefone?.message}>
                        <Input
                          id="telefone"
                          inputMode="tel"
                          placeholder="(11) 91234-5678"
                          invalid={!!errors.telefone}
                          {...register('telefone')}
                        />
                      </Field>

                      <Field label="RG (opcional)" htmlFor="rg" error={errors.rg?.message}>
                        <Input id="rg" placeholder="00.000.000-0" invalid={!!errors.rg} {...register('rg')} />
                      </Field>

                      <Field label="Endereço" htmlFor="endereco" error={errors.endereco?.message}>
                        <Input
                          id="endereco"
                          placeholder="Rua das Acácias, 120 — São Paulo, SP"
                          invalid={!!errors.endereco}
                          {...register('endereco')}
                        />
                      </Field>

                      <Field
                        className="sm:col-span-2"
                        label="Observações (opcional)"
                        htmlFor="observacoes"
                        error={errors.observacoes?.message}
                      >
                        <Textarea
                          id="observacoes"
                          rows={3}
                          placeholder="Algo que a escola deva saber? Conte pra gente."
                          invalid={!!errors.observacoes}
                          {...register('observacoes')}
                        />
                      </Field>
                    </div>
                  </section>

                  {menor && (
                    <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface-2 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <SectionLabel>Responsável financeiro</SectionLabel>
                        <Badge tone="warning" dot={false}>
                          Obrigatório para menores
                        </Badge>
                      </div>
                      <p className="text-[13px] text-ink-muted">
                        Como o aluno tem menos de 18 anos, precisamos dos dados de quem responde pela matrícula.
                      </p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field
                          className="sm:col-span-2"
                          label="Nome do responsável"
                          htmlFor="responsavelNome"
                          required
                          error={errors.responsavelNome?.message}
                        >
                          <Input
                            id="responsavelNome"
                            placeholder="Marcos Lima Andrade"
                            invalid={!!errors.responsavelNome}
                            {...register('responsavelNome')}
                          />
                        </Field>

                        <Field
                          label="CPF"
                          htmlFor="responsavelCpf"
                          required
                          error={errors.responsavelCpf?.message}
                        >
                          <Input
                            id="responsavelCpf"
                            inputMode="numeric"
                            placeholder="987.654.321-00"
                            invalid={!!errors.responsavelCpf}
                            {...register('responsavelCpf')}
                          />
                        </Field>

                        <Field
                          label="Telefone"
                          htmlFor="responsavelTelefone"
                          error={errors.responsavelTelefone?.message}
                        >
                          <Input
                            id="responsavelTelefone"
                            inputMode="tel"
                            placeholder="(11) 99876-5432"
                            invalid={!!errors.responsavelTelefone}
                            {...register('responsavelTelefone')}
                          />
                        </Field>

                        <Field
                          className="sm:col-span-2"
                          label="E-mail"
                          htmlFor="responsavelEmail"
                          error={errors.responsavelEmail?.message}
                        >
                          <Input
                            id="responsavelEmail"
                            type="email"
                            placeholder="marcos.andrade@email.com"
                            invalid={!!errors.responsavelEmail}
                            {...register('responsavelEmail')}
                          />
                        </Field>
                      </div>
                    </section>
                  )}

                  <div className="flex flex-col gap-3">
                    <Button type="submit" variant="cta" loading={isSubmitting} className="h-[52px] w-full text-base">
                      Enviar solicitação
                    </Button>
                    <p className="text-center text-[13px] text-ink-subtle">
                      Depois de enviar, a escola avalia o pedido e responde por e-mail. Se aprovado, você recebe um
                      link para criar sua senha.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
