import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Eye, EyeSlash, WarningCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { definirSenha } from '@/api/auth'
import { mensagemErro } from '@/lib/api'

const definirSenhaSchema = z
  .object({
    novaSenha: z.string().min(8, 'Use ao menos 8 caracteres.'),
    confirmarSenha: z.string().min(1, 'Confirme a senha.'),
  })
  .refine((d) => d.novaSenha === d.confirmarSenha, {
    path: ['confirmarSenha'],
    message: 'As senhas não conferem.',
  })

type DefinirSenhaForm = z.infer<typeof definirSenhaSchema>

/** Níveis de força da senha (cálculo client-side; a API não retorna força). */
const NIVEIS_FORCA = [
  { label: '', barra: 'bg-line', texto: 'text-ink-muted' },
  { label: 'Força: fraca', barra: 'bg-danger', texto: 'text-[#B23A18]' },
  { label: 'Força: média', barra: 'bg-warning', texto: 'text-[#7A5A00]' },
  { label: 'Força: boa', barra: 'bg-success', texto: 'text-success-dark' },
  { label: 'Força: forte', barra: 'bg-success', texto: 'text-success-dark' },
] as const

function calcularForca(senha: string): number {
  if (!senha) return 0
  let pontos = 0
  if (senha.length >= 8) pontos++
  if (senha.length >= 12) pontos++
  if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) pontos++
  if (/\d/.test(senha)) pontos++
  if (/[^A-Za-z0-9]/.test(senha)) pontos++
  return Math.min(4, Math.max(1, pontos))
}

/** Medidor de força: 4 barras + rótulo textual à direita. */
function MedidorForca({ senha }: { senha: string }) {
  if (!senha) return null
  const nivel = calcularForca(senha)
  const info = NIVEIS_FORCA[nivel]
  return (
    <div className="mt-2 flex items-center gap-3">
      <div className="flex flex-1 gap-1.5" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i <= nivel ? info.barra : 'bg-line'}`}
          />
        ))}
      </div>
      <span className={`text-[13px] font-semibold ${info.texto}`}>{info.label}</span>
    </div>
  )
}

/** Input de senha com botão de mostrar/ocultar. */
function CampoSenha({
  id,
  invalid,
  disabled,
  registro,
  autoComplete,
}: {
  id: string
  invalid: boolean
  disabled: boolean
  registro: ReturnType<ReturnType<typeof useForm<DefinirSenhaForm>>['register']>
  autoComplete: string
}) {
  const [visivel, setVisivel] = useState(false)
  return (
    <div className="relative">
      <Input
        id={id}
        type={visivel ? 'text' : 'password'}
        className="pr-12"
        placeholder="••••••••"
        autoComplete={autoComplete}
        invalid={invalid}
        disabled={disabled}
        {...registro}
      />
      <button
        type="button"
        onClick={() => setVisivel((v) => !v)}
        disabled={disabled}
        aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
        className="absolute inset-y-0 right-0 grid w-12 place-items-center text-ink-muted transition-colors hover:text-ink disabled:cursor-not-allowed"
      >
        {visivel ? <EyeSlash size={20} /> : <Eye size={20} />}
      </button>
    </div>
  )
}

export default function DefinirSenhaPage() {
  const [sp] = useSearchParams()
  const token = sp.get('token')
  const [sucesso, setSucesso] = useState(false)
  const [erroApi, setErroApi] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DefinirSenhaForm>({
    resolver: zodResolver(definirSenhaSchema),
    defaultValues: { novaSenha: '', confirmarSenha: '' },
  })

  const novaSenha = watch('novaSenha')

  async function onSubmit(values: DefinirSenhaForm) {
    if (!token) return
    setErroApi(null)
    try {
      await definirSenha({ token, novaSenha: values.novaSenha })
      setSucesso(true)
    } catch (e) {
      setErroApi(mensagemErro(e))
    }
  }

  // Estado 1: token ausente na URL — link inválido.
  if (!token) {
    return (
      <Card className="mx-auto w-full max-w-[452px]">
        <CardContent className="flex flex-col items-center px-8 py-10 text-center">
          <div className="grid size-[72px] place-items-center rounded-full bg-danger-bg">
            <WarningCircle size={38} weight="fill" className="text-danger" />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-[-.015em] text-ink">Link inválido</h1>
          <p className="mt-2 max-w-[320px] text-[15px] leading-relaxed text-ink-muted">
            Este link não é válido ou já foi usado. Solicite um novo em "Esqueci minha senha".
          </p>
          <Button asChild variant="secondary" size="default" className="mt-6 w-full">
            <Link to="/login">
              <ArrowLeft size={20} />
              Voltar para o login
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Estado 2: senha definida com sucesso.
  if (sucesso) {
    return (
      <Card className="mx-auto w-full max-w-[452px]">
        <CardContent className="flex flex-col items-center px-8 py-10 text-center">
          <div className="grid size-[72px] place-items-center rounded-full bg-success-bg">
            <CheckCircle size={40} weight="fill" className="text-success" />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-[-.015em] text-ink">Senha definida!</h1>
          <p className="mt-2 max-w-[320px] text-[15px] leading-relaxed text-ink-muted">
            Você já pode entrar na sua conta.
          </p>
          <Button asChild variant="cta" size="default" className="mt-6 w-full">
            <Link to="/login">Ir para o login</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Estado 3: formulário de definição de senha.
  return (
    <Card className="mx-auto w-full max-w-[452px]">
      <CardContent className="px-8 py-9">
        <h1 className="text-2xl font-bold tracking-[-.015em] text-ink">Criar sua senha</h1>
        <p className="mt-1.5 text-[15px] text-ink-muted">Escolha uma senha para o seu primeiro acesso.</p>

        {erroApi && (
          <div className="mt-5 flex items-start gap-3 rounded border-[1.5px] border-[#F3C5B4] bg-danger-bg p-3.5">
            <WarningCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-danger" />
            <div className="text-[13px] font-medium leading-snug text-[#B23A18]">
              {erroApi || 'Este link expirou ou é inválido.'}{' '}
              <Link to="/esqueci-senha" className="font-semibold underline">
                Solicitar um novo link
              </Link>
              .
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-5" noValidate>
          <div>
            <Field label="Nova senha" htmlFor="novaSenha" error={errors.novaSenha?.message} hint="Use ao menos 8 caracteres.">
              <CampoSenha
                id="novaSenha"
                autoComplete="new-password"
                invalid={!!errors.novaSenha}
                disabled={isSubmitting}
                registro={register('novaSenha')}
              />
            </Field>
            <MedidorForca senha={novaSenha} />
          </div>

          <Field label="Confirmar senha" htmlFor="confirmarSenha" error={errors.confirmarSenha?.message}>
            <CampoSenha
              id="confirmarSenha"
              autoComplete="new-password"
              invalid={!!errors.confirmarSenha}
              disabled={isSubmitting}
              registro={register('confirmarSenha')}
            />
          </Field>

          <Button type="submit" variant="cta" size="default" loading={isSubmitting} className="mt-1 w-full">
            {isSubmitting ? 'Salvando…' : 'Salvar senha'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:underline"
          >
            <ArrowLeft size={16} />
            Voltar para o login
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
