package com.henrique.escolaidiomas.application.identity.usecase;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.identity.dto.DefinirSenhaViaTokenInput;
import com.henrique.escolaidiomas.domain.identity.enums.TipoToken;
import com.henrique.escolaidiomas.domain.identity.model.TokenVerificacao;
import com.henrique.escolaidiomas.domain.identity.model.Usuario;
import com.henrique.escolaidiomas.domain.identity.port.PasswordEncoderPort;
import com.henrique.escolaidiomas.domain.identity.port.TokenVerificacaoRepository;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/**
 * Consome um token (1o acesso ou recuperacao) e define a senha do usuario.
 * Se o token e' de ATIVACAO, tambem ativa a conta (RN-39). Serve tambem a
 * recuperacao de senha (RN-40).
 */
@Service
@RequiredArgsConstructor
public class DefinirSenhaViaTokenUseCase {

    private final TokenVerificacaoRepository tokenVerificacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoderPort passwordEncoder;

    @Transactional
    public void execute(DefinirSenhaViaTokenInput input) {
        TokenVerificacao tokenVerificacao = tokenVerificacaoRepository.buscarPorToken(input.token())
                .orElseThrow(() -> new NegocioException("Link de verificacao invalido."));

        tokenVerificacao.validar();

        Usuario usuario = tokenVerificacao.getUsuario();
        usuario.definirSenha(passwordEncoder.encode(input.novaSenha()));

        if (tokenVerificacao.getTipo() == TipoToken.ATIVACAO) {
            usuario.ativarConta();
        }

        tokenVerificacao.marcarComoUtilizado();

        usuarioRepository.salvar(usuario);
        tokenVerificacaoRepository.salvar(tokenVerificacao);
    }
}
