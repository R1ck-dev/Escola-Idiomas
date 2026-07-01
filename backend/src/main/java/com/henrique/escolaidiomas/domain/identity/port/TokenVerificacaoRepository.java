package com.henrique.escolaidiomas.domain.identity.port;

import java.util.Optional;

import com.henrique.escolaidiomas.domain.identity.model.TokenVerificacao;

/** Porta de persistencia dos tokens de verificacao (1o acesso / recuperacao). */
public interface TokenVerificacaoRepository {
    TokenVerificacao salvar(TokenVerificacao token);
    Optional<TokenVerificacao> buscarPorToken(String token);
}
