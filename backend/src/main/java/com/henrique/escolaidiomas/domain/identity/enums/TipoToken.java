package com.henrique.escolaidiomas.domain.identity.enums;

/**
 * Finalidade de um TokenVerificacao. ATIVACAO habilita o 1o acesso (RN-39);
 * RECUPERACAO_SENHA atende o "esqueci minha senha" (RN-40). A definicao de senha
 * pelo link e' o mesmo fluxo; ATIVACAO adicionalmente ativa a conta.
 */
public enum TipoToken {
    ATIVACAO,
    RECUPERACAO_SENHA
}
