import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Boletim, FrequenciaTurma, Mensalidade, PixCobranca, Semestre, TurmaDoAluno } from '@/types/api'

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

export function useMinhaFrequencia(semestreId?: string) {
  return useQuery({
    queryKey: ['aluno', 'frequencia', semestreId ?? 'vigente'],
    queryFn: async () =>
      (await api.get<FrequenciaTurma[]>('/api/alunos/me/frequencia', { params: semestreId ? { semestreId } : {} }))
        .data,
  })
}

export function useMinhasMensalidades() {
  return useQuery({
    queryKey: ['aluno', 'mensalidades'],
    queryFn: async () => (await api.get<Mensalidade[]>('/api/alunos/me/mensalidades')).data,
  })
}

/** Cobrança PIX de uma mensalidade do próprio aluno (só busca quando há id selecionado). */
export function useMinhaPix(mensalidadeId: string | null) {
  return useQuery({
    queryKey: ['aluno', 'pix', mensalidadeId],
    enabled: mensalidadeId != null,
    queryFn: async () =>
      (await api.get<PixCobranca>(`/api/alunos/me/mensalidades/${mensalidadeId}/pix`)).data,
  })
}

export function useSemestres() {
  return useQuery({
    queryKey: ['semestres'],
    queryFn: async () => (await api.get<Semestre[]>('/api/semestres')).data,
  })
}
