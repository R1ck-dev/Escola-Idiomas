-- V4__matricula.sql
-- Contextos: identity (aluno + responsavel), matricula e financeiro (mensalidade).
-- Fecha o fluxo: solicitar -> aprovar (1o acesso + 1a mensalidade pro-rata) / rejeitar.

-- Responsavel financeiro do aluno menor (RN-18). Nao e' usuario do sistema.
CREATE TABLE responsaveis (
    id       UUID PRIMARY KEY,
    nome     VARCHAR(255) NOT NULL,
    cpf      VARCHAR(14)  NOT NULL UNIQUE,
    telefone VARCHAR(20),
    email    VARCHAR(255)
);

-- Subtipo Aluno (heranca JOINED). CPF unico permite reusar o cadastro (RN-08).
CREATE TABLE alunos (
    usuario_id      UUID PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    data_nascimento DATE,
    cpf             VARCHAR(14) NOT NULL UNIQUE,
    rg              VARCHAR(20),
    telefone        VARCHAR(20),
    endereco        VARCHAR(255),
    observacoes     VARCHAR(1000),
    responsavel_id  UUID REFERENCES responsaveis(id)
);

-- Matricula: Aluno<->Turma com ciclo de vida (RN-08/27).
CREATE TABLE matriculas (
    id              UUID PRIMARY KEY,
    aluno_id        UUID NOT NULL REFERENCES usuarios(id),
    turma_id        UUID NOT NULL REFERENCES turmas(id),
    data_matricula  DATE NOT NULL,
    status          VARCHAR(30) NOT NULL,   -- AGUARDANDO_APROVACAO | ATIVA | TRANCADA | ENCERRADA | REJEITADA
    motivo_rejeicao VARCHAR(500)
);
CREATE INDEX idx_matriculas_turma  ON matriculas (turma_id);
CREATE INDEX idx_matriculas_aluno  ON matriculas (aluno_id);
CREATE INDEX idx_matriculas_status ON matriculas (status);

-- Mensalidade por matricula (RN-11). Guarda valor_base + percentual (valor efetivo e' derivado).
CREATE TABLE mensalidades (
    id             UUID PRIMARY KEY,
    matricula_id   UUID NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
    competencia    VARCHAR(7)    NOT NULL,   -- "yyyy-MM"
    valor_base     NUMERIC(10,2) NOT NULL,
    percentual     INT           NOT NULL,   -- 100 | 75 | 50 | 25 (pro-rata)
    vencimento     DATE          NOT NULL,
    status         VARCHAR(20)   NOT NULL,   -- ABERTA | PAGA | ATRASADA | CANCELADA
    data_pagamento DATE,
    is_prorata     BOOLEAN       NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_mensalidades_matricula ON mensalidades (matricula_id);
