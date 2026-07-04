import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-canvas px-5 text-center">
      <Logo />
      <div>
        <div className="font-mono text-5xl font-extrabold text-brand">404</div>
        <p className="mt-3 max-w-sm text-ink-muted">Não encontramos esta página.</p>
      </div>
      <Button asChild variant="secondary">
        <Link to="/">Voltar ao início</Link>
      </Button>
    </div>
  )
}
