-- V6__academico.sql
-- Modulo academico: semestre, ocorrencia de aula, presenca e avaliacao (RN-31 a 35).

-- Semestre letivo global (ex.: "2026-2"). Delimita apuracao de notas/frequencia.
CREATE TABLE semestres (
    id          UUID PRIMARY KEY,
    referencia  VARCHAR(20) NOT NULL UNIQUE,
    data_inicio DATE NOT NULL,
    data_fim    DATE NOT NULL
);

-- Ocorrencia de aula: criada quando o professor abre a turma no dia (RN-35).
-- Unica por turma+semestre+data (idempotencia da chamada).
CREATE TABLE aulas (
    id          UUID PRIMARY KEY,
    turma_id    UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    semestre_id UUID NOT NULL REFERENCES semestres(id),
    data        DATE NOT NULL,
    UNIQUE (turma_id, semestre_id, data)
);
CREATE INDEX idx_aulas_turma_semestre ON aulas (turma_id, semestre_id);

-- Presenca/falta por aula e matricula (RN-35). Unica por aula+matricula.
CREATE TABLE presencas (
    id           UUID PRIMARY KEY,
    aula_id      UUID NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
    matricula_id UUID NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
    presente     BOOLEAN NOT NULL,
    UNIQUE (aula_id, matricula_id)
);
CREATE INDEX idx_presencas_matricula ON presencas (matricula_id);

-- Nota do semestre por matricula (RN-31): MIDTERM/FINAL, 0 a 100. Unica por matricula+semestre+tipo.
CREATE TABLE avaliacoes (
    id           UUID PRIMARY KEY,
    matricula_id UUID NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
    semestre_id  UUID NOT NULL REFERENCES semestres(id),
    tipo         VARCHAR(10) NOT NULL,   -- MIDTERM | FINAL
    nota         INT NOT NULL,
    UNIQUE (matricula_id, semestre_id, tipo)
);
CREATE INDEX idx_avaliacoes_matricula_semestre ON avaliacoes (matricula_id, semestre_id);
