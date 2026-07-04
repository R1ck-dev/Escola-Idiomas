import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  AlunoNaTurma,
  Avaliacao,
  Boletim,
  Chamada,
  LancarNotaPayload,
  RegistrarChamadaPayload,
  Semestre,
  Turma,
} from '@/types/api'

export function useMinhasTurmasProfessor() {
  return useQuery({
    queryKey: ['professor', 'turmas'],
    queryFn: async () => (await api.get<Turma[]>('/api/professores/me/turmas')).data,
  })
}

export function useAlunosDaTurma(turmaId: string | undefined) {
  return useQuery({
    queryKey: ['professor', 'turma', turmaId, 'alunos'],
    queryFn: async () => (await api.get<AlunoNaTurma[]>(`/api/professores/me/turmas/${turmaId}/alunos`)).data,
    enabled: !!turmaId,
  })
}

export function useChamada(turmaId: string | undefined, data?: string) {
  return useQuery({
    queryKey: ['professor', 'chamada', turmaId, data ?? 'hoje'],
    queryFn: async () =>
      (
        await api.get<Chamada>('/api/chamadas', {
          params: { turmaId, ...(data ? { data } : {}) },
        })
      ).data,
    enabled: !!turmaId,
  })
}

export function useRegistrarChamada() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: RegistrarChamadaPayload) =>
      (await api.post<Chamada>('/api/chamadas', payload)).data,
    onSuccess: (_res, payload) => {
      qc.invalidateQueries({ queryKey: ['professor', 'chamada', payload.turmaId] })
    },
  })
}

export function useLancarNota() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: LancarNotaPayload) => (await api.post<Avaliacao>('/api/notas', payload)).data,
    onSuccess: (_res, payload) => {
      qc.invalidateQueries({ queryKey: ['boletim', payload.matriculaId] })
      // A tabela de boletim da turma e o pre-preenchimento de notas usam outra chave
      // (['professor','turma',turmaId,'boletins',...]); invalida o prefixo para refletir a nota.
      qc.invalidateQueries({ queryKey: ['professor', 'turma'] })
    },
  })
}

export function useBoletim(matriculaId: string | undefined, semestreId?: string) {
  return useQuery({
    queryKey: ['boletim', matriculaId, semestreId ?? 'vigente'],
    queryFn: async () =>
      (
        await api.get<Boletim>('/api/boletins', {
          params: { matriculaId, ...(semestreId ? { semestreId } : {}) },
        })
      ).data,
    enabled: !!matriculaId,
  })
}

export function useBoletinsDaTurma(turmaId: string | undefined, semestreId?: string) {
  return useQuery({
    queryKey: ['professor', 'turma', turmaId, 'boletins', semestreId ?? 'vigente'],
    queryFn: async () =>
      (
        await api.get<Boletim[]>(`/api/professores/me/turmas/${turmaId}/boletins`, {
          params: { ...(semestreId ? { semestreId } : {}) },
        })
      ).data,
    enabled: !!turmaId,
  })
}

export function useSemestres() {
  return useQuery({
    queryKey: ['semestres'],
    queryFn: async () => (await api.get<Semestre[]>('/api/semestres')).data,
  })
}
