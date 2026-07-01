package com.henrique.escolaidiomas.application.identity.usecase;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.identity.dto.LoginInput;
import com.henrique.escolaidiomas.domain.identity.model.Usuario;
import com.henrique.escolaidiomas.domain.identity.port.AuthenticationPort;
import com.henrique.escolaidiomas.domain.identity.port.TokenServicePort;

import lombok.RequiredArgsConstructor;

/**
 * Autentica um usuario por e-mail/senha e devolve um JWT. Depende apenas de portas.
 */
@Service
@RequiredArgsConstructor
public class AutenticarUsuarioUseCase {

    private final AuthenticationPort authenticationPort;
    private final TokenServicePort tokenServicePort;

    public String execute(LoginInput input) {
        Usuario usuarioAutenticado = authenticationPort.autenticar(input.email(), input.password());
        return tokenServicePort.gerarToken(usuarioAutenticado);
    }
}
