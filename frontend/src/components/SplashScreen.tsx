import { Logo } from './Logo'
import { Spinner } from './ui/spinner'

/** Tela de carregamento inicial (enquanto valida a sessão). */
export function SplashScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-canvas">
      <Logo size="lg" symbolOnly />
      <Spinner className="text-brand" />
    </div>
  )
}
