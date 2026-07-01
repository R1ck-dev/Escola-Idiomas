package com.henrique.escolaidiomas.infrastructure.config.security;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.identity.enums.StatusUsuario;
import com.henrique.escolaidiomas.domain.identity.model.Usuario;
import com.henrique.escolaidiomas.domain.identity.port.AuthenticationPort;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

import lombok.RequiredArgsConstructor;

/**
 * Autenticacao por e-mail/senha. Mensagem generica ("Credenciais invalidas")
 * para nao revelar se o e-mail existe. Conta sem senha (pendente) ou nao-ativa
 * nao autentica.
 */
@Component
@RequiredArgsConstructor
public class SpringAuthenticationAdapter implements AuthenticationPort {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Usuario autenticar(String email, String rawPassword) {
        Usuario usuario = usuarioRepository.buscarPorEmail(email)
                .orElseThrow(() -> new NegocioException("Credenciais invalidas."));

        if (usuario.getSenhaHash() == null
                || !passwordEncoder.matches(rawPassword, usuario.getSenhaHash())) {
            throw new NegocioException("Credenciais invalidas.");
        }

        if (usuario.getStatus() != StatusUsuario.ATIVO) {
            throw new NegocioException("Conta pendente ou inativa. Verifique o seu e-mail.");
        }

        return usuario;
    }
}
