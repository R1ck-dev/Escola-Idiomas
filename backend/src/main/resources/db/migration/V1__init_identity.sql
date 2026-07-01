-- V1__init_identity.sql
-- Contexto: identity. Schema base de autenticacao (heranca JOINED de Usuario).
-- Ver Docs/03-arquitetura/Modelagem-de-Dados.md e Padroes-de-Arquitetura.md.

-- Tabela base: dados comuns de autenticacao de todo usuario.
CREATE TABLE usuarios (
    id         UUID PRIMARY KEY,
    nome       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255),                 -- null ate a ativacao por e-mail (RN-39)
    status     VARCHAR(30)  NOT NULL,        -- PENDENTE_VERIFICACAO | ATIVO | INATIVO
    role       VARCHAR(20)  NOT NULL,        -- GESTAO | PROFESSOR | ALUNO
    criado_em  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Subtipo gestao (heranca JOINED): compartilha a PK do usuario base.
-- Aluno e Professor entram nas fatias de cadastro/matricula.
CREATE TABLE gestao (
    usuario_id UUID PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tokens de verificacao por e-mail: 1o acesso (RN-39) e recuperacao de senha (RN-40).
-- Tabela ja criada aqui; o mapeamento/uso vem na fatia de ativacao por e-mail.
CREATE TABLE tokens_verificacao (
    id             UUID PRIMARY KEY,
    usuario_id     UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token          VARCHAR(255) NOT NULL UNIQUE,
    tipo           VARCHAR(30)  NOT NULL,    -- ATIVACAO | RECUPERACAO_SENHA
    data_expiracao TIMESTAMPTZ  NOT NULL,
    utilizado      BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_tokens_verificacao_token ON tokens_verificacao (token);
