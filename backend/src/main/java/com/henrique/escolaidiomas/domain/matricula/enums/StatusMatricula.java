package com.henrique.escolaidiomas.domain.matricula.enums;

/**
 * Ciclo de vida da matricula (RN-27). Nasce AGUARDANDO_APROVACAO; a gestao aprova
 * (ATIVA), rejeita (REJEITADA) ou coloca em LISTA_ESPERA quando falta vaga (RN-20).
 * Da lista de espera pode ser aprovada (alocada) ou rejeitada. Uma matricula ativa
 * pode ser TRANCADA ou ENCERRADA.
 */
public enum StatusMatricula {
    AGUARDANDO_APROVACAO,
    LISTA_ESPERA,
    ATIVA,
    TRANCADA,
    ENCERRADA,
    REJEITADA
}
