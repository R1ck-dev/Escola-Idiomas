import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchMe, login as apiLogin } from '@/api/auth'
import { tokenStore, UNAUTHORIZED_EVENT } from '@/lib/tokenStore'
import type { LoginPayload, MeuPerfil } from '@/types/api'

interface AuthContextValue {
  user: MeuPerfil | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<MeuPerfil>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient()
  const [token, setToken] = useState<string | null>(() => tokenStore.get())

  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
  })

  // Sessão expirada (401 numa requisição autenticada) → derruba a sessão.
  useEffect(() => {
    const handler = () => {
      setToken(null)
      qc.removeQueries({ queryKey: ['me'] })
    }
    window.addEventListener(UNAUTHORIZED_EVENT, handler)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler)
  }, [qc])

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { token: t } = await apiLogin(payload)
      tokenStore.set(t)
      setToken(t)
      return qc.fetchQuery({ queryKey: ['me'], queryFn: fetchMe })
    },
    [qc],
  )

  const logout = useCallback(() => {
    tokenStore.clear()
    setToken(null)
    qc.clear()
  }, [qc])

  const value: AuthContextValue = {
    user: meQuery.data ?? null,
    isLoading: !!token && meQuery.isLoading,
    isAuthenticated: !!meQuery.data,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
