-- V2__professor.sql
-- Contexto: identity. Subtipo Professor (RN-04) na heranca JOINED.
-- Guarda dados de contato e de repasse (chave PIX / dados bancarios — RN-13).

CREATE TABLE professores (
    usuario_id          UUID PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    cpf                 VARCHAR(14)  NOT NULL UNIQUE,
    rg                  VARCHAR(20),
    telefone            VARCHAR(20),
    chave_pix           VARCHAR(140),
    dados_bancarios     VARCHAR(255),
    idiomas_habilitados VARCHAR(500)   -- descritivo; sistema NAO valida idioma (RN-36)
);
