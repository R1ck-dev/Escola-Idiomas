import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { CheckCircle } from '@phosphor-icons/react'
import { recuperarSenha } from '@/api/auth'
import { mensagemErro } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/field'
import { toast } from '@/components/ui/toaster'

const recuperarSchema = z.object({
  email: z.string().min(1, 'Informe seu e-mail.').email('E-mail inválido.'),
})

type RecuperarForm = z.infer<typeof recuperarSchema>

export default function EsqueciSenhaPage() {
  const [enviado, setEnviado] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecuperarForm>({
    resolver: zodResolver(recuperarSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(values: RecuperarForm) {
    try {
      await recuperarSenha(values.email)
      setEnviado(true)
    } catch (e) {
      toast.error(mensagemErro(e))
    }
  }

  if (enviado) {
    return (
      <Card className="p-8 text-center sm:p-10">
        <div className="mx-auto grid size-[72px] place-items-center rounded-full bg-info-bg text-info">
          <CheckCircle size={34} weight="fill" />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold tracking-[-.01em] text-ink">Verifique seu e-mail</h1>
        <p className="mx-auto mt-3 max-w-[320px] leading-relaxed text-ink-muted">
          Se o e-mail estiver cadastrado, enviamos um link para redefinir a senha.
        </p>
        <Button asChild variant="secondary" size="default" className="mt-8 w-full">
          <Link to="/login">
            <span aria-hidden="true">←</span> Voltar para o login
          </Link>
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-8 sm:p-10">
      <h1 className="text-2xl font-extrabold tracking-[-.01em] text-ink">Esqueci minha senha</h1>
      <p className="mt-2 leading-relaxed text-ink-muted">
        Informe seu e-mail e enviaremos um link para você criar uma nova senha.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-6" noValidate>
        <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="maria.silva@email.com"
            invalid={!!errors.email}
            disabled={isSubmitting}
            {...register('email')}
          />
        </Field>

        <Button type="submit" size="default" loading={isSubmitting} className="w-full">
          Enviar link
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:underline"
        >
          <span aria-hidden="true">←</span> Voltar para o login
        </Link>
      </div>
    </Card>
  )
}
