-- V3__turma.sql
-- Contexto: turma. Turmas de idioma (RN-05/06). professor_id referencia o usuario
-- base (id do professor). Alterar valor afeta apenas mensalidades futuras (RN-30).

CREATE TABLE turmas (
    id                UUID PRIMARY KEY,
    professor_id      UUID NOT NULL REFERENCES usuarios(id),
    nome              VARCHAR(120)  NOT NULL,
    idioma            VARCHAR(60)   NOT NULL,
    nivel             VARCHAR(60),
    dias_semana       VARCHAR(100),
    hora_inicio       TIME,
    hora_fim          TIME,
    valor_mensalidade NUMERIC(10,2) NOT NULL,
    lotacao_maxima    INT           NOT NULL DEFAULT 12,   -- RN-06
    ativa             BOOLEAN       NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_turmas_professor ON turmas (professor_id);
