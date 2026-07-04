import type { Role } from '@/types/api'

/** Home de cada perfil (para onde redirecionar após o login). */
export const roleHome: Record<Role, string> = {
  GESTAO: '/gestao',
  PROFESSOR: '/professor',
  ALUNO: '/aluno',
}
