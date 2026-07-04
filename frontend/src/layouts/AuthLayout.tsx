import { Outlet } from 'react-router-dom'
import { Logo } from '@/components/Logo'

/** Layout das telas de acesso: painel de marca (navy) + área do formulário. */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Painel de marca — só no desktop */}
      <aside className="relative hidden w-[42%] max-w-[560px] flex-col justify-between overflow-hidden bg-navy-950 p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-28 size-[420px] rounded-full border border-white/[.06]" />
        <div className="absolute -right-8 -top-16 size-[300px] rounded-full border border-white/[.05]" />
        <Logo onDark />
        <div className="relative">
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-[-.02em]">
            A sua escola,
            <br />
            organizada num só lugar.
          </h1>
          <p className="mt-5 max-w-md text-lg text-navy-100">
            Matrículas, turmas, notas e financeiro — para a gestão, os professores e as famílias.
          </p>
        </div>
        <p className="relative font-mono text-xs tracking-wide text-navy-300">Escola de Idiomas · MVP</p>
      </aside>

      {/* Área do formulário */}
      <main className="flex flex-1 flex-col items-center justify-center bg-canvas px-5 py-10">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
