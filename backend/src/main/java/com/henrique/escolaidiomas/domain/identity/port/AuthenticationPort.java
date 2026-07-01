package com.henrique.escolaidiomas.domain.identity.port;

import com.henrique.escolaidiomas.domain.identity.model.Usuario;

/**
 * Porta de autenticacao: valida credenciais e devolve o usuario autenticado.
 */
public interface AuthenticationPort {
    Usuario autenticar(String email, String rawPassword);
}
