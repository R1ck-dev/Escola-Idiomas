import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Buildings, ChalkboardTeacher, Eye, EyeSlash, Student } from '@phosphor-icons/react';

import { Card, CardContent } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/toaster';
import { useAuth } from '@/auth/AuthContext';
import { roleHome } from '@/auth/roleHome';
import { mensagemErro } from '@/lib/api';

const loginSchema = z.object({
  email: z.string().min(1, 'Informe seu e-mail.').email('E-mail inválido.'),
  password: z.string().min(1, 'Informe sua senha.'),
});

type LoginForm = z.infer<typeof loginSchema>;

/** Contas semeadas por scripts/seed-teste.sh — só usadas no painel de dev. */
const CONTAS_TESTE = [
  { chave: 'GESTAO', label: 'Gestão', email: 'gestao.verify@escolaidiomas.local', senha: 'Gestor@123', Icone: Buildings },
  { chave: 'PROFESSOR', label: 'Professor', email: 'prof.ana@escola.local', senha: 'Prof@123', Icone: ChalkboardTeacher },
  { chave: 'ALUNO', label: 'Aluno', email: 'aluno.joao@escola.local', senha: 'Aluno@123', Icone: Student },
] as const;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [acessoRapido, setAcessoRapido] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function entrar(email: string, password: string, chave?: string) {
    if (chave) setAcessoRapido(chave);
    try {
      const me = await login({ email, password });
      navigate(roleHome[me.role]);
    } catch (e) {
      toast.error(mensagemErro(e));
    } finally {
      if (chave) setAcessoRapido(null);
    }
  }

  const ocupado = isSubmitting || acessoRapido !== null;

  return (
    <Card className="w-full max-w-[428px] rounded-2xl">
      <CardContent className="p-8 sm:p-10">
        <div className="mb-7 space-y-1.5">
          <h1 className="text-2xl font-bold text-ink">Entrar</h1>
          <p className="text-ink-muted">Acesse a sua conta.</p>
        </div>

        <form onSubmit={handleSubmit((v) => entrar(v.email, v.password))} noValidate className="space-y-5">
          <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="maria.silva@email.com"
              invalid={!!errors.email}
              disabled={ocupado}
              {...register('email')}
            />
          </Field>

          <Field label="Senha" htmlFor="password" error={errors.password?.message}>
            <div className="relative">
              <Input
                id="password"
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Sua senha"
                className="pr-12"
                invalid={!!errors.password}
                disabled={ocupado}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                disabled={ocupado}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-ink-subtle hover:text-ink"
              >
                {mostrarSenha ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </Field>

          <div className="flex justify-end">
            <Link
              to="/esqueci-senha"
              className="text-sm font-medium text-brand hover:text-brand-dark hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>

          <Button type="submit" variant="cta" size="default" loading={isSubmitting} disabled={ocupado} className="w-full">
            Entrar
          </Button>
        </form>

        {import.meta.env.DEV && (
          <div className="mt-7 rounded-xl border border-dashed border-line-strong bg-surface-2 p-4">
            <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[.12em] text-ink-subtle">
              Acesso rápido · ambiente de teste
            </p>
            <div className="grid grid-cols-3 gap-2">
              {CONTAS_TESTE.map(({ chave, label, email, senha, Icone }) => (
                <button
                  key={chave}
                  type="button"
                  onClick={() => entrar(email, senha, chave)}
                  disabled={ocupado}
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-2 py-3 text-[12.5px] font-semibold text-ink transition hover:border-brand hover:bg-navy-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {acessoRapido === chave ? <Spinner /> : <Icone size={22} weight="fill" className="text-brand" />}
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-center text-[11px] text-ink-subtle">Visível apenas em desenvolvimento.</p>
          </div>
        )}
      </CardContent>

      <p className="px-8 pb-8 text-center text-sm text-ink-muted sm:px-10">
        Precisa de ajuda? Fale com a secretaria da escola.
      </p>
    </Card>
  );
}
