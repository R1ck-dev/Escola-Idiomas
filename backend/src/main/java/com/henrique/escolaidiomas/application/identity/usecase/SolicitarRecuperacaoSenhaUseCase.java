package com.henrique.escolaidiomas.application.identity.usecase;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.domain.identity.enums.StatusUsuario;
import com.henrique.escolaidiomas.domain.identity.enums.TipoToken;
import com.henrique.escolaidiomas.domain.identity.model.TokenVerificacao;
import com.henrique.escolaidiomas.domain.identity.port.EmailSenderPort;
import com.henrique.escolaidiomas.domain.identity.port.TokenVerificacaoRepository;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/**
 * RN-40: usuario solicita "esqueci minha senha". Se existir uma conta ATIVA com o
 * e-mail, gera token de recuperacao e envia o link. Nao revela se o e-mail existe
 * (responde sempre 200 no controller) para nao permitir enumeracao de contas.
 */
@Service
@RequiredArgsConstructor
public class SolicitarRecuperacaoSenhaUseCase {

    private final UsuarioRepository usuarioRepository;
    private final TokenVerificacaoRepository tokenVerificacaoRepository;
    private final EmailSenderPort emailSenderPort;

    @Transactional
    public void execute(String email) {
        usuarioRepository.buscarPorEmail(email)
                .filter(usuario -> usuario.getStatus() == StatusUsuario.ATIVO)
                .ifPresent(usuario -> {
                    TokenVerificacao token = new TokenVerificacao(usuario, TipoToken.RECUPERACAO_SENHA);
                    tokenVerificacaoRepository.salvar(token);
                    emailSenderPort.enviarEmailRecuperacaoSenha(usuario.getEmail(), usuario.getNome(), token.getToken());
                });
    }
}
