package com.henrique.escolaidiomas.infrastructure.persistence.identity.adapter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

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

    @Async
    @Override
    public void enviarEmailListaEspera(String destinatario, String nome, String turmaNome) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(remetente);
        message.setTo(destinatario);
        message.setSubject("Voce esta na lista de espera - Escola de Idiomas");
        message.setText("Ola, " + nome + "!\n\n" +
                "No momento a turma \"" + turmaNome + "\" esta sem vagas, entao voce entrou na "
                + "lista de espera.\n" +
                "Assim que uma vaga abrir, a escola entra em contato para efetivar a matricula.\n\n" +
                "Qualquer duvida, fale com a gente.");

        mailSender.send(message);
    }

    @Async
    @Override
    public void enviarAlertaVagaAberta(String destinatario, String turmaNome, int naListaEspera, long vagas) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(remetente);
        message.setTo(destinatario);
        message.setSubject("Vaga aberta em turma com lista de espera - Escola de Idiomas");
        message.setText("Abriu vaga na turma \"" + turmaNome + "\".\n\n" +
                "Vagas disponiveis: " + vagas + "\n" +
                "Candidatos na lista de espera: " + naListaEspera + "\n\n" +
                "Entre em contato com o proximo candidato e faca a alocacao pelo painel de matriculas.");

        mailSender.send(message);
    }

    @Async
    @Override
    public void enviarAvisoCobranca(String destinatario, String nome, String competencia,
            BigDecimal valor, LocalDate vencimento) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(remetente);
        message.setTo(destinatario);
        message.setSubject("Mensalidade " + competencia + " - Escola de Idiomas");
        message.setText("Ola, " + nome + "!\n\n" +
                "A mensalidade da competencia " + competencia + " foi gerada.\n" +
                "Valor: R$ " + valor + "\n" +
                "Vencimento: " + vencimento + "\n\n" +
                "Apos o vencimento incidem multa de 2% e mora de R$ 1,00 por dia (teto de 30 dias).");

        mailSender.send(message);
    }

    @Async
    @Override
    public void enviarAvisoAtraso(String destinatario, String nome, String competencia,
            BigDecimal valorAtualizado, long diasAtraso) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(remetente);
        message.setTo(destinatario);
        message.setSubject("Mensalidade " + competencia + " em atraso - Escola de Idiomas");
        message.setText("Ola, " + nome + "!\n\n" +
                "A mensalidade da competencia " + competencia + " esta em atraso ha " + diasAtraso + " dia(s).\n" +
                "Valor atualizado (com multa e mora): R$ " + valorAtualizado + "\n\n" +
                "Regularize junto a escola para evitar o acumulo da mora.");

        mailSender.send(message);
    }

    @Async
    @Override
    public void enviarAlertaInadimplenciaGestao(String destinatario, List<String> linhas) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(remetente);
        message.setTo(destinatario);
        message.setSubject("Alerta de inadimplencia (30 dias) - Escola de Idiomas");
        message.setText("Os seguintes alunos atingiram 30 dias de atraso e precisam de contato:\n\n" +
                String.join("\n", linhas));

        mailSender.send(message);
    }
}
