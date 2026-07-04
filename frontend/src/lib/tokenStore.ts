const KEY = 'ei_token'

/** Guarda o JWT no localStorage (MVP: único token, 24h, sem refresh). */
export const tokenStore = {
  get: (): string | null => localStorage.getItem(KEY),
  set: (token: string) => localStorage.setItem(KEY, token),
  clear: () => localStorage.removeItem(KEY),
}

export const UNAUTHORIZED_EVENT = 'ei:unauthorized'
