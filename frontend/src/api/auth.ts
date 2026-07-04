import { api } from '@/lib/api'
import type { DefinirSenhaPayload, LoginPayload, MeuPerfil, TokenResponse } from '@/types/api'

export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>('/api/auth/login', payload)
  return data
}

export async function fetchMe(): Promise<MeuPerfil> {
  const { data } = await api.get<MeuPerfil>('/api/usuarios/me')
  return data
}

export async function recuperarSenha(email: string): Promise<void> {
  await api.post('/api/auth/recuperar-senha', { email })
}

export async function definirSenha(payload: DefinirSenhaPayload): Promise<void> {
  await api.post('/api/auth/definir-senha', payload)
}
