package com.henrique.escolaidiomas.domain.matricula.enums;

/**
 * Ciclo de vida da matricula (RN-27). Nasce AGUARDANDO_APROVACAO; a gestao aprova
 * (ATIVA) ou rejeita (REJEITADA). Depois pode ser TRANCADA ou ENCERRADA.
 */
public enum StatusMatricula {
    AGUARDANDO_APROVACAO,
    ATIVA,
    TRANCADA,
    ENCERRADA,
    REJEITADA
}
