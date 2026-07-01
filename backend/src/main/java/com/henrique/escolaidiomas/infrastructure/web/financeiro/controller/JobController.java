package com.henrique.escolaidiomas.infrastructure.web.financeiro.controller;

import java.time.YearMonth;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.henrique.escolaidiomas.application.financeiro.usecase.GerarMensalidadesMensaisUseCase;

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

    @Value("${app.job.trigger-secret:}")
    private String jobSecret;

    /** RN-09: gera as mensalidades da competencia (default: mes atual). */
    @PostMapping("/gerar-mensalidades")
    public ResponseEntity<Map<String, Object>> gerarMensalidades(
            @RequestHeader(value = "X-Job-Secret", required = false) String secret,
            @RequestParam(required = false) Integer ano,
            @RequestParam(required = false) Integer mes) {

        if (!StringUtils.hasText(jobSecret) || !jobSecret.equals(secret)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("erro", "Segredo de job invalido ou ausente."));
        }

        YearMonth alvo = (ano != null && mes != null) ? YearMonth.of(ano, mes) : YearMonth.now();
        int geradas = gerarMensalidadesMensaisUseCase.execute(alvo.getYear(), alvo.getMonthValue());

        return ResponseEntity.ok(Map.<String, Object>of(
                "competencia", alvo.toString(),
                "geradas", geradas));
    }
}
