package com.henrique.escolaidiomas.infrastructure.web.financeiro.controller;

import java.time.YearMonth;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.henrique.escolaidiomas.application.financeiro.dto.MensalidadeDTO;
import com.henrique.escolaidiomas.application.financeiro.usecase.ConfirmarPagamentoPixUseCase;
import com.henrique.escolaidiomas.application.financeiro.usecase.GerarMensalidadesMensaisUseCase;
import com.henrique.escolaidiomas.application.financeiro.usecase.VerificarInadimplenciaUseCase;

import lombok.RequiredArgsConstructor;

/**
 * Endpoints de job acionados por cron externo (o free do Render dorme e mata o
 * @Scheduled — ver ADR-002). Protegidos por um segredo no header X-Job-Secret.
 * Os jobs sao idempotentes (seguros contra chamadas repetidas).
 */
@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
public class JobController {

    private final GerarMensalidadesMensaisUseCase gerarMensalidadesMensaisUseCase;
    private final VerificarInadimplenciaUseCase verificarInadimplenciaUseCase;
    private final ConfirmarPagamentoPixUseCase confirmarPagamentoPixUseCase;

    @Value("${app.job.trigger-secret:}")
    private String jobSecret;

    /** RN-09: gera as mensalidades da competencia (default: mes atual). */
    @PostMapping("/gerar-mensalidades")
    public ResponseEntity<Map<String, Object>> gerarMensalidades(
            @RequestHeader(value = "X-Job-Secret", required = false) String secret,
            @RequestParam(required = false) Integer ano,
            @RequestParam(required = false) Integer mes) {

        if (segredoInvalido(secret)) {
            return naoAutorizado();
        }

        YearMonth alvo = (ano != null && mes != null) ? YearMonth.of(ano, mes) : YearMonth.now();
        int geradas = gerarMensalidadesMensaisUseCase.execute(alvo.getYear(), alvo.getMonthValue());

        return ResponseEntity.ok(Map.<String, Object>of(
                "competencia", alvo.toString(),
                "geradas", geradas));
    }

    /** RN-29/41: avisa atrasos e alerta a gestao sobre quem atingiu 30 dias. */
    @PostMapping("/verificar-inadimplencia")
    public ResponseEntity<Map<String, Object>> verificarInadimplencia(
            @RequestHeader(value = "X-Job-Secret", required = false) String secret) {

        if (segredoInvalido(secret)) {
            return naoAutorizado();
        }

        VerificarInadimplenciaUseCase.Resultado r = verificarInadimplenciaUseCase.execute();
        return ResponseEntity.ok(Map.<String, Object>of(
                "avisosAtrasoEnviados", r.avisosAtrasoEnviados(),
                "itensAtingiram30Dias", r.itensAtingiram30Dias(),
                "gestoresNotificados", r.gestoresNotificados()));
    }

    /**
     * RN-26: confirmacao (simulada) de pagamento PIX — mimetiza o webhook de um PSP.
     * Protegido pelo mesmo segredo dos jobs (o PSP real assinaria a chamada).
     */
    @PostMapping("/pix/confirmar")
    public ResponseEntity<?> confirmarPix(
            @RequestHeader(value = "X-Job-Secret", required = false) String secret,
            @RequestParam UUID mensalidadeId) {

        if (segredoInvalido(secret)) {
            return naoAutorizado();
        }

        MensalidadeDTO paga = confirmarPagamentoPixUseCase.execute(mensalidadeId);
        return ResponseEntity.ok(paga);
    }

    private boolean segredoInvalido(String secret) {
        return !StringUtils.hasText(jobSecret) || !jobSecret.equals(secret);
    }

    private ResponseEntity<Map<String, Object>> naoAutorizado() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("erro", "Segredo de job invalido ou ausente."));
    }
}
