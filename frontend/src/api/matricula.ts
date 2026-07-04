import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Matricula, SolicitarMatriculaPayload, TurmaPublica } from '@/types/api'

/** US-04 (público): candidato/responsável solicita matrícula via link. */
export async function solicitarMatricula(payload: SolicitarMatriculaPayload): Promise<Matricula> {
  const { data } = await api.post<Matricula>('/api/matriculas', payload)
  return data
}

/** US-04 (público): dados da turma exibidos no link de matrícula. */
export function useTurmaPublica(turmaId: string | undefined) {
  return useQuery({
    queryKey: ['turma-publica', turmaId],
    queryFn: async () => (await api.get<TurmaPublica>(`/api/turmas/${turmaId}/publica`)).data,
    enabled: !!turmaId,
  })
}
