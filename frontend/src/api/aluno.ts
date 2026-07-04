import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Boletim, Mensalidade, TurmaDoAluno } from '@/types/api'

export function useMinhasTurmasAluno() {
  return useQuery({
    queryKey: ['aluno', 'turmas'],
    queryFn: async () => (await api.get<TurmaDoAluno[]>('/api/alunos/me/turmas')).data,
  })
}

export function useMeuBoletim(semestreId?: string) {
  return useQuery({
    queryKey: ['aluno', 'boletim', semestreId ?? 'vigente'],
    queryFn: async () =>
      (await api.get<Boletim[]>('/api/alunos/me/boletim', { params: semestreId ? { semestreId } : {} })).data,
  })
}

export function useMinhasMensalidades() {
  return useQuery({
    queryKey: ['aluno', 'mensalidades'],
    queryFn: async () => (await api.get<Mensalidade[]>('/api/alunos/me/mensalidades')).data,
  })
}
