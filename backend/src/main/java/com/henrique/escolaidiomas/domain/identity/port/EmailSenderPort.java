package com.henrique.escolaidiomas.domain.identity.port;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

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

    /** RN-20: aviso ao candidato de que entrou na lista de espera da turma (sem vaga no momento). */
    void enviarEmailListaEspera(String destinatario, String nome, String turmaNome);

    /** RN-20: alerta a gestao de que abriu vaga numa turma com candidatos na lista de espera. */
    void enviarAlertaVagaAberta(String destinatario, String turmaNome, int naListaEspera, long vagas);

    /** RN-41: aviso de cobranca ao responsavel/aluno quando a mensalidade e' gerada. */
    void enviarAvisoCobranca(String destinatario, String nome, String competencia,
            BigDecimal valor, LocalDate vencimento);

    /** RN-41: aviso de atraso ao responsavel/aluno (com multa/mora ja aplicadas). */
    void enviarAvisoAtraso(String destinatario, String nome, String competencia,
            BigDecimal valorAtualizado, long diasAtraso);

    /** RN-29: digest a gestao com os alunos que atingiram o teto de 30 dias de atraso. */
    void enviarAlertaInadimplenciaGestao(String destinatario, List<String> linhas);
}
