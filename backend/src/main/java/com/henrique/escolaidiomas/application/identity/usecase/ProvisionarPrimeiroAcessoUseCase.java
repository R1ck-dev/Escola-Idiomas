package com.henrique.escolaidiomas.application.identity.usecase;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.domain.identity.enums.TipoToken;
import com.henrique.escolaidiomas.domain.identity.model.TokenVerificacao;
import com.henrique.escolaidiomas.domain.identity.model.Usuario;
import com.henrique.escolaidiomas.domain.identity.port.EmailSenderPort;
import com.henrique.escolaidiomas.domain.identity.port.TokenVerificacaoRepository;

import lombok.RequiredArgsConstructor;

/**
 * Passo reutilizavel do 1o acesso (RN-39): gera um token de ATIVACAO e dispara o
 * e-mail com o link de definicao de senha. Sera reusado pela aprovacao de
 * matricula do aluno (RN-02) alem do cadastro de professor (RN-04).
 */
@Service
@RequiredArgsConstructor
public class ProvisionarPrimeiroAcessoUseCase {

    private final TokenVerificacaoRepository tokenVerificacaoRepository;
    private final EmailSenderPort emailSenderPort;

    public void execute(Usuario usuario) {
        TokenVerificacao token = new TokenVerificacao(usuario, TipoToken.ATIVACAO);
        tokenVerificacaoRepository.salvar(token);
        emailSenderPort.enviarEmailPrimeiroAcesso(usuario.getEmail(), usuario.getNome(), token.getToken());
    }
}
