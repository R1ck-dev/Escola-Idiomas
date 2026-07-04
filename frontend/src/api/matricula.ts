import { api } from '@/lib/api'
import type { Matricula, SolicitarMatriculaPayload } from '@/types/api'

/** US-04 (público): candidato/responsável solicita matrícula via link. */
export async function solicitarMatricula(payload: SolicitarMatriculaPayload): Promise<Matricula> {
  const { data } = await api.post<Matricula>('/api/matriculas', payload)
  return data
}
