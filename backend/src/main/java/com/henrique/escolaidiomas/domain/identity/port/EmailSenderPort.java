package com.henrique.escolaidiomas.domain.identity.port;

/**
 * Porta de envio de e-mails transacionais. A implementacao (JavaMail) monta o
 * link a partir da base-url e envia de forma assincrona.
 */
public interface EmailSenderPort {
    /** RN-39: link de definicao de senha no 1o acesso. */
    void enviarEmailPrimeiroAcesso(String destinatario, String nome, String token);

    /** RN-40: link de redefinicao de senha. */
    void enviarEmailRecuperacaoSenha(String destinatario, String nome, String token);

    /** RN-19: aviso de rejeicao de matricula ao solicitante. */
    void enviarEmailRejeicao(String destinatario, String nome, String motivo);
}
