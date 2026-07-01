package com.henrique.escolaidiomas.domain.identity.enums;

/**
 * Ciclo de vida da conta. Uma conta nasce PENDENTE_VERIFICACAO (sem senha) e passa
 * a ATIVO ao definir a senha pelo link de e-mail (RN-39). INATIVO desliga o acesso.
 */
public enum StatusUsuario {
    PENDENTE_VERIFICACAO,
    ATIVO,
    INATIVO
}
