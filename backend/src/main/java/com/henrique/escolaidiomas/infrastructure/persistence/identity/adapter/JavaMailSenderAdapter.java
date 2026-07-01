package com.henrique.escolaidiomas.infrastructure.persistence.identity.adapter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.identity.port.EmailSenderPort;

import lombok.RequiredArgsConstructor;

/**
 * Envio de e-mails via JavaMail, de forma assincrona (@Async) para nao travar a
 * requisicao. O link aponta para a pagina de definicao de senha do frontend.
 */
@Component
@RequiredArgsConstructor
public class JavaMailSenderAdapter implements EmailSenderPort {

    private final JavaMailSender mailSender;

    @Value("${app.web.base-url}")
    private String webBaseUrl;

    @Value("${app.mail.from}")
    private String remetente;

    @Async
    @Override
    public void enviarEmailPrimeiroAcesso(String destinatario, String nome, String token) {
        String url = webBaseUrl + "/definir-senha?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(remetente);
        message.setTo(destinatario);
        message.setSubject("Bem-vindo(a) a Escola de Idiomas - defina a sua senha");
        message.setText("Ola, " + nome + "!\n\n" +
                "A sua conta foi criada. Para acessar, defina a sua senha pelo link abaixo:\n" +
                url + "\n\n" +
                "O link e' valido por 24 horas.");

        mailSender.send(message);
    }

    @Async
    @Override
    public void enviarEmailRecuperacaoSenha(String destinatario, String nome, String token) {
        String url = webBaseUrl + "/definir-senha?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(remetente);
        message.setTo(destinatario);
        message.setSubject("Recuperacao de senha - Escola de Idiomas");
        message.setText("Ola, " + nome + "!\n\n" +
                "Recebemos um pedido para redefinir a sua senha. Use o link abaixo:\n" +
                url + "\n\n" +
                "Se nao foi voce, ignore este e-mail. O link e' valido por 24 horas.");

        mailSender.send(message);
    }

    @Async
    @Override
    public void enviarEmailRejeicao(String destinatario, String nome, String motivo) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(remetente);
        message.setTo(destinatario);
        message.setSubject("Sobre a sua solicitacao de matricula - Escola de Idiomas");
        message.setText("Ola, " + nome + "!\n\n" +
                "Infelizmente nao foi possivel efetivar a matricula neste momento.\n" +
                "Motivo: " + motivo + "\n\n" +
                "Qualquer duvida, entre em contato com a escola.");

        mailSender.send(message);
    }
}
