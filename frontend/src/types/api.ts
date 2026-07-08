// Tipos espelhando os DTOs/enums do backend (Spring). Enums como union types
// (o projeto usa `erasableSyntaxOnly`, então nada de `enum` do TS).

export type Role = 'GESTAO' | 'PROFESSOR' | 'ALUNO'
export type StatusUsuario = 'PENDENTE_VERIFICACAO' | 'ATIVO' | 'INATIVO'
export type StatusMatricula = 'AGUARDANDO_APROVACAO' | 'ATIVA' | 'TRANCADA' | 'ENCERRADA' | 'REJEITADA'
export type StatusMensalidade = 'ABERTA' | 'PAGA' | 'ATRASADA' | 'CANCELADA'
export type CategoriaDespesa = 'LUZ' | 'ALUGUEL' | 'REPASSE_PROFESSOR' | 'OUTROS'
export type TipoAvaliacao = 'MIDTERM' | 'FINAL'
export type SituacaoAprovacao = 'APROVADO' | 'REPROVADO' | 'EM_ANDAMENTO'

/** Envelope de paginação do backend (Spring). `page` é índice 0-based. */
export interface Pagina<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface TokenResponse {
  token: string
  tipo: string
}

export interface MeuPerfil {
  id: string
  nome: string
  email: string
  role: Role
  status: StatusUsuario
  criadoEm: string
}

export interface Turma {
  id: string
  professorId: string
  nome: string
  idioma: string
  nivel: string | null
  diasSemana: string | null
  horaInicio: string | null // "HH:mm:ss"
  horaFim: string | null
  valorMensalidade: number
  lotacaoMaxima: number
  ocupacaoAtual: number
  ativa: boolean
}

/** Turma exposta publicamente (GET /api/turmas/{id}/publica): sem professor/ocupação. */
export interface TurmaPublica {
  id: string
  nome: string
  idioma: string
  nivel: string | null
  diasSemana: string | null
  horaInicio: string | null // "HH:mm:ss"
  horaFim: string | null
  valorMensalidade: number
  turmaCheia: boolean
}

/** Turma do próprio aluno (GET /api/alunos/me/turmas): tem professorNome, NÃO tem ocupacaoAtual. */
export interface TurmaDoAluno {
  id: string
  professorId: string
  professorNome: string | null
  nome: string
  idioma: string
  nivel: string | null
  diasSemana: string | null
  horaInicio: string | null // "HH:mm:ss"
  horaFim: string | null
  valorMensalidade: number
  lotacaoMaxima: number
  ativa: boolean
}

export interface Matricula {
  id: string
  alunoId: string
  turmaId: string
  dataMatricula: string // "yyyy-MM-dd"
  status: StatusMatricula
  motivoRejeicao: string | null
}

export interface Mensalidade {
  id: string
  matriculaId: string
  competencia: string // "yyyy-MM"
  valorBase: number
  percentual: number
  valorEfetivo: number
  vencimento: string // "yyyy-MM-dd"
  situacao: StatusMensalidade
  diasAtraso: number
  valorAtualizado: number
  prorata: boolean
  dataPagamento: string | null
}

export interface AlunoNaTurma {
  matriculaId: string
  alunoId: string
  alunoNome: string
}

export interface PresencaLinha {
  matriculaId: string
  alunoId: string
  alunoNome: string
  presente: boolean | null // null = ainda não marcado
}

export interface Chamada {
  aulaId: string | null
  turmaId: string
  semestreId: string
  data: string // "yyyy-MM-dd"
  presencas: PresencaLinha[]
}

export interface Avaliacao {
  id: string
  matriculaId: string
  semestreId: string
  tipo: TipoAvaliacao
  nota: number
}

export interface Boletim {
  matriculaId: string
  alunoId: string
  alunoNome: string
  turmaId: string
  turmaNome: string | null
  semestreId: string
  semestreReferencia: string
  notaMidterm: number | null
  notaFinal: number | null
  media: number | null
  faltas: number
  totalAulas: number
  percentualFaltas: number
  situacao: SituacaoAprovacao
}

export interface Semestre {
  id: string
  referencia: string
  dataInicio: string
  dataFim: string
}

/** Uma ocorrência de aula na visão do aluno. `presente: null` = aula sem registro de chamada. */
export interface AulaFrequencia {
  aulaId: string
  data: string // "yyyy-MM-dd"
  presente: boolean | null
}

/** Frequência detalhada do aluno numa turma/semestre (GET /api/alunos/me/frequencia); casa com Boletim por matriculaId. */
export interface FrequenciaTurma {
  matriculaId: string
  turmaId: string
  turmaNome: string | null
  semestreId: string
  faltas: number
  totalAulas: number
  percentualFaltas: number
  aulas: AulaFrequencia[]
}

// ---- Leitura da gestão (DTOs enriquecidos) ----

export interface Professor {
  id: string
  nome: string
  email: string
  status: StatusUsuario
  telefone: string | null
  idiomasHabilitados: string | null
}

/** Retorno enxuto do cadastro de professor (POST /api/professores). */
export interface ProfessorResumo {
  id: string
  nome: string
  email: string
  status: StatusUsuario
}

/** Matrícula com nomes já resolvidos (aluno/turma/responsável) para a tabela da gestão. */
export interface MatriculaDetalhada {
  id: string
  alunoId: string
  alunoNome: string | null
  alunoEmail: string | null
  turmaId: string
  turmaNome: string | null
  dataMatricula: string // "yyyy-MM-dd"
  status: StatusMatricula
  motivoRejeicao: string | null
  menorIdade: boolean
  responsavelNome: string | null
  responsavelCpf: string | null
  responsavelTelefone: string | null
  responsavelEmail: string | null
}

/** Detalhe do aluno para a gestão (GET /api/alunos/{id}): dados + turmas, mensalidades e boletim. */
export interface AlunoDetalhe {
  id: string
  nome: string
  email: string
  cpf: string | null
  rg: string | null
  telefone: string | null
  dataNascimento: string | null // "yyyy-MM-dd"
  endereco: string | null
  observacoes: string | null
  menor: boolean
  responsavelNome: string | null
  responsavelCpf: string | null
  responsavelTelefone: string | null
  responsavelEmail: string | null
  turmas: TurmaDoAluno[]
  mensalidades: Mensalidade[]
  boletins: Boletim[]
}

/** Linha do painel financeiro da gestão: mensalidade + nomes de aluno/turma. */
export interface MensalidadePainel {
  id: string
  matriculaId: string
  alunoNome: string | null
  turmaNome: string | null
  competencia: string // "yyyy-MM"
  valorBase: number
  percentual: number
  valorEfetivo: number
  vencimento: string // "yyyy-MM-dd"
  situacao: StatusMensalidade
  diasAtraso: number
  valorAtualizado: number
  prorata: boolean
  dataPagamento: string | null
}

/** Turma no painel da gestão: com nome do professor e ocupação atual (x/lotação). */
export interface TurmaGestao {
  id: string
  professorId: string
  professorNome: string | null
  nome: string
  idioma: string
  nivel: string | null
  diasSemana: string | null
  horaInicio: string | null // "HH:mm:ss"
  horaFim: string | null
  valorMensalidade: number
  lotacaoMaxima: number
  ocupacaoAtual: number
  ativa: boolean
}

/** Síntese do mês para o início da gestão. */
export interface Dashboard {
  competencia: string // "yyyy-MM"
  recebido: number
  emAberto: number
  emAtraso: number
  inadimplentes: number
  totalMensalidades: number
  pagas: number
  solicitacoesPendentes: number
}

export interface Despesa {
  id: string
  descricao: string
  categoria: CategoriaDespesa
  valor: number
  data: string // "yyyy-MM-dd"
  professorId: string | null
}

// ---- Payloads de entrada ----

export interface LoginPayload {
  email: string
  password: string
}

export interface DefinirSenhaPayload {
  token: string
  novaSenha: string
}

export interface MarcarPresenca {
  matriculaId: string
  presente: boolean
}

export interface RegistrarChamadaPayload {
  turmaId: string
  data?: string
  presencas: MarcarPresenca[]
}

export interface LancarNotaPayload {
  matriculaId: string
  semestreId?: string
  tipo: TipoAvaliacao
  nota: number
}

export interface DadosAlunoMatricula {
  nome: string
  email: string
  dataNascimento?: string
  cpf: string
  rg?: string
  telefone?: string
  endereco?: string
  observacoes?: string
}

export interface DadosResponsavelMatricula {
  nome: string
  cpf: string
  telefone?: string
  email?: string
}

export interface SolicitarMatriculaPayload {
  turmaId: string
  aluno: DadosAlunoMatricula
  responsavel?: DadosResponsavelMatricula
}

export interface RejeitarMatriculaPayload {
  motivo: string
}

export interface CadastrarProfessorPayload {
  nome: string
  email: string
  cpf: string
  rg?: string
  telefone?: string
  chavePix?: string
  dadosBancarios?: string
  idiomasHabilitados?: string
}

export interface AtualizarProfessorPayload {
  nome: string
  telefone?: string | null
  chavePix?: string | null
  dadosBancarios?: string | null
  idiomasHabilitados?: string | null
}

export interface CriarTurmaPayload {
  professorId: string
  nome: string
  idioma: string
  nivel?: string
  diasSemana?: string
  horaInicio?: string // "HH:mm"
  horaFim?: string
  valorMensalidade: number
  lotacaoMaxima?: number
}

export interface AtualizarTurmaPayload extends CriarTurmaPayload {
  ativa?: boolean
}

export interface RegistrarDespesaPayload {
  descricao: string
  categoria: CategoriaDespesa
  valor: number
  data?: string // "yyyy-MM-dd"
  professorId?: string
}

export interface CriarSemestrePayload {
  referencia: string
  dataInicio: string // "yyyy-MM-dd"
  dataFim: string
}
