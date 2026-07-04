import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  AtualizarProfessorPayload,
  AtualizarTurmaPayload,
  CadastrarProfessorPayload,
  CriarSemestrePayload,
  CriarTurmaPayload,
  Dashboard,
  Despesa,
  MatriculaDetalhada,
  MensalidadePainel,
  Professor,
  ProfessorResumo,
  RegistrarDespesaPayload,
  RejeitarMatriculaPayload,
  Semestre,
  StatusMatricula,
  Turma,
  TurmaGestao,
} from '@/types/api'

// ---------- Início / Dashboard (G1) ----------

export function useDashboard(competencia?: string) {
  return useQuery({
    queryKey: ['gestao', 'dashboard', competencia ?? 'atual'],
    queryFn: async () =>
      (await api.get<Dashboard>('/api/gestao/dashboard', { params: competencia ? { competencia } : {} })).data,
  })
}

// ---------- Matrículas (G2 / G3) ----------

export function useMatriculas(status?: StatusMatricula) {
  return useQuery({
    queryKey: ['gestao', 'matriculas', status ?? 'todas'],
    queryFn: async () =>
      (await api.get<MatriculaDetalhada[]>('/api/matriculas', { params: status ? { status } : {} })).data,
  })
}

/** Invalida matrículas + dashboard após uma transição de status. */
function useMatriculaAcao<TVars>(fn: (vars: TVars) => Promise<unknown>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gestao', 'matriculas'] })
      qc.invalidateQueries({ queryKey: ['gestao', 'dashboard'] })
    },
  })
}

export function useAprovarMatricula() {
  return useMatriculaAcao((id: string) => api.post(`/api/matriculas/${id}/aprovar`))
}

export function useRejeitarMatricula() {
  return useMatriculaAcao(({ id, motivo }: { id: string } & RejeitarMatriculaPayload) =>
    api.post(`/api/matriculas/${id}/rejeitar`, { motivo }),
  )
}

export function useTrancarMatricula() {
  return useMatriculaAcao((id: string) => api.post(`/api/matriculas/${id}/trancar`))
}

export function useEncerrarMatricula() {
  return useMatriculaAcao((id: string) => api.post(`/api/matriculas/${id}/encerrar`))
}

// ---------- Turmas (G4) ----------

export function useTurmasGestao() {
  return useQuery({
    queryKey: ['gestao', 'turmas'],
    queryFn: async () => (await api.get<TurmaGestao[]>('/api/gestao/turmas')).data,
  })
}

export function useCriarTurma() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CriarTurmaPayload) => (await api.post<Turma>('/api/turmas', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gestao', 'turmas'] }),
  })
}

export function useAtualizarTurma() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & AtualizarTurmaPayload) =>
      (await api.put<Turma>(`/api/turmas/${id}`, payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gestao', 'turmas'] }),
  })
}

// ---------- Professores (G5) ----------

export function useProfessores() {
  return useQuery({
    queryKey: ['gestao', 'professores'],
    queryFn: async () => (await api.get<Professor[]>('/api/professores')).data,
  })
}

export function useCadastrarProfessor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CadastrarProfessorPayload) =>
      (await api.post<ProfessorResumo>('/api/professores', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gestao', 'professores'] }),
  })
}

export function useAtualizarProfessor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & AtualizarProfessorPayload) =>
      (await api.put<Professor>(`/api/professores/${id}`, payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gestao', 'professores'] }),
  })
}

export function useReenviarConviteProfessor() {
  return useMutation({
    mutationFn: async (id: string) =>
      (await api.post<{ mensagem: string }>(`/api/professores/${id}/reenviar-convite`)).data,
  })
}

// ---------- Financeiro (G6) ----------

export function useMensalidades(competencia: string) {
  return useQuery({
    queryKey: ['gestao', 'mensalidades', competencia],
    queryFn: async () =>
      (await api.get<MensalidadePainel[]>('/api/mensalidades', { params: { competencia } })).data,
    enabled: !!competencia,
  })
}

export function useDarBaixa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, dataPagamento }: { id: string; dataPagamento?: string }) =>
      (await api.post<MensalidadePainel>(`/api/mensalidades/${id}/baixa`, null, {
        params: dataPagamento ? { dataPagamento } : {},
      })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gestao', 'mensalidades'] })
      qc.invalidateQueries({ queryKey: ['gestao', 'dashboard'] })
    },
  })
}

/** Estorna uma mensalidade PAGA, revertendo-a para ABERTA/ATRASADA. */
export function useEstornarBaixa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) =>
      (await api.post<MensalidadePainel>(`/api/mensalidades/${id}/estornar`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gestao', 'mensalidades'] })
      qc.invalidateQueries({ queryKey: ['gestao', 'dashboard'] })
    },
  })
}

// ---------- Despesas (G7) ----------

export function useDespesas(competencia: string) {
  return useQuery({
    queryKey: ['gestao', 'despesas', competencia],
    queryFn: async () => (await api.get<Despesa[]>('/api/despesas', { params: { competencia } })).data,
    enabled: !!competencia,
  })
}

export function useRegistrarDespesa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: RegistrarDespesaPayload) => (await api.post<Despesa>('/api/despesas', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gestao', 'despesas'] }),
  })
}

export function useAtualizarDespesa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & RegistrarDespesaPayload) =>
      (await api.put<Despesa>(`/api/despesas/${id}`, payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gestao', 'despesas'] }),
  })
}

export function useExcluirDespesa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/despesas/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gestao', 'despesas'] }),
  })
}

// ---------- Semestres (G8) ----------

export function useSemestres() {
  return useQuery({
    queryKey: ['gestao', 'semestres'],
    queryFn: async () => (await api.get<Semestre[]>('/api/semestres')).data,
  })
}

export function useCriarSemestre() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CriarSemestrePayload) => (await api.post<Semestre>('/api/semestres', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gestao', 'semestres'] }),
  })
}
