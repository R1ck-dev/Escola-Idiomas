import type { BadgeTone } from '@/components/ui/badge'
import type {
  CategoriaDespesa,
  Role,
  SituacaoAprovacao,
  StatusMatricula,
  StatusMensalidade,
  StatusUsuario,
  TipoAvaliacao,
} from '@/types/api'

interface StatusInfo {
  label: string
  tone: BadgeTone
}

export const statusMatricula: Record<StatusMatricula, StatusInfo> = {
  AGUARDANDO_APROVACAO: { label: 'Aguardando aprovação', tone: 'warning' },
  LISTA_ESPERA: { label: 'Lista de espera', tone: 'info' },
  ATIVA: { label: 'Ativa', tone: 'success' },
  TRANCADA: { label: 'Trancada', tone: 'neutralAlt' },
  ENCERRADA: { label: 'Encerrada', tone: 'neutral' },
  REJEITADA: { label: 'Rejeitada', tone: 'danger' },
}

export const statusMensalidade: Record<StatusMensalidade, StatusInfo> = {
  ABERTA: { label: 'Em aberto', tone: 'info' },
  PAGA: { label: 'Paga', tone: 'success' },
  ATRASADA: { label: 'Atrasada', tone: 'danger' },
  CANCELADA: { label: 'Cancelada', tone: 'neutral' },
}

export const situacaoAprovacao: Record<SituacaoAprovacao, StatusInfo> = {
  APROVADO: { label: 'Aprovado', tone: 'success' },
  REPROVADO: { label: 'Reprovado', tone: 'danger' },
  EM_ANDAMENTO: { label: 'Em andamento', tone: 'warning' },
}

export const statusUsuario: Record<StatusUsuario, StatusInfo> = {
  PENDENTE_VERIFICACAO: { label: 'Aguardando 1º acesso', tone: 'warning' },
  ATIVO: { label: 'Ativo', tone: 'success' },
  INATIVO: { label: 'Inativo', tone: 'neutral' },
}

export const roleLabel: Record<Role, string> = {
  GESTAO: 'Gestão',
  PROFESSOR: 'Professor',
  ALUNO: 'Aluno',
}

export const tipoAvaliacaoLabel: Record<TipoAvaliacao, string> = {
  MIDTERM: 'Prova do meio',
  FINAL: 'Prova final',
}

export const categoriaDespesaLabel: Record<CategoriaDespesa, string> = {
  LUZ: 'Luz',
  ALUGUEL: 'Aluguel',
  REPASSE_PROFESSOR: 'Repasse a professor',
  OUTROS: 'Outros',
}
