import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { roleHome } from './roleHome'
import { SplashScreen } from '@/components/SplashScreen'
import type { Role } from '@/types/api'

/** Protege rotas: exige sessão e, opcionalmente, um dos perfis informados. */
export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, isLoading, isAuthenticated } = useAuth()

  if (isLoading) return <SplashScreen />
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={roleHome[user.role]} replace />

  return <Outlet />
}
