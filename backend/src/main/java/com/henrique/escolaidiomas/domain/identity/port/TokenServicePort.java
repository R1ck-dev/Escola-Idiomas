package com.henrique.escolaidiomas.domain.identity.port;

import com.henrique.escolaidiomas.domain.identity.model.Usuario;

/**
 * Porta de emissao/leitura de tokens de acesso (JWT). A implementacao concreta
 * (JJWT/HS256) vive na infraestrutura.
 */
public interface TokenServicePort {
    String gerarToken(Usuario usuario);
    String obterIdDoUsuario(String token);
    String obterRoleDoUsuario(String token);
}
