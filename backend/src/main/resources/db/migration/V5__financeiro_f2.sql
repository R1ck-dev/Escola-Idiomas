-- V5__financeiro_f2.sql
-- Financeiro F2: despesas/saidas do caixa (US-16/RN-12/13) e controle do aviso de atraso (RN-41).

-- Saidas do caixa. professor_id preenchido apenas em REPASSE_PROFESSOR (RN-13).
CREATE TABLE despesas (
    id           UUID PRIMARY KEY,
    descricao    VARCHAR(255)  NOT NULL,
    categoria    VARCHAR(30)   NOT NULL,   -- LUZ | ALUGUEL | REPASSE_PROFESSOR | OUTROS
    valor        NUMERIC(10,2) NOT NULL,
    data         DATE          NOT NULL,
    professor_id UUID REFERENCES usuarios(id)
);
CREATE INDEX idx_despesas_data      ON despesas (data);
CREATE INDEX idx_despesas_professor ON despesas (professor_id);

-- RN-41: garante que o aviso de atraso ao responsavel/aluno sai uma unica vez.
ALTER TABLE mensalidades
    ADD COLUMN aviso_atraso_enviado BOOLEAN NOT NULL DEFAULT FALSE;
