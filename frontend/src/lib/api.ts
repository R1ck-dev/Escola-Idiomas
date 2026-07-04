import axios, { isAxiosError } from 'axios'
import { tokenStore, UNAUTHORIZED_EVENT } from './tokenStore'

// Dev: baseURL vazia → chama /api na mesma origem (proxy do Vite → backend), sem CORS.
// Prod: defina VITE_API_URL com a URL do backend.
const baseURL = import.meta.env.VITE_API_URL ?? ''

export const api = axios.create({ baseURL })

// Anexa o JWT em toda requisição.
api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 401 numa requisição AUTENTICADA = sessão expirada → limpa e avisa a app.
// (Um 401 sem token — ex.: login inválido — não dispara logout global.)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (isAxiosError(error) && error.response?.status === 401 && tokenStore.get()) {
      tokenStore.clear()
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    return Promise.reject(error)
  },
)

/** Extrai a mensagem de erro do backend ({"erro":...} ou mapa de validação). */
export function mensagemErro(error: unknown, fallback = 'Algo deu errado. Tente novamente.'): string {
  if (isAxiosError(error)) {
    const data = error.response?.data
    if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>
      if (typeof obj.erro === 'string') return obj.erro
      const first = Object.values(obj)[0]
      if (typeof first === 'string') return first
    }
    if (error.code === 'ERR_NETWORK') return 'Sem conexão com o servidor. Verifique sua internet.'
  }
  return fallback
}
