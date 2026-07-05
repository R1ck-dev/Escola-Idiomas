package com.henrique.escolaidiomas.infrastructure.web.financeiro.controller;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.henrique.escolaidiomas.application.financeiro.dto.MensalidadeDTO;
import com.henrique.escolaidiomas.application.financeiro.dto.MensalidadePainelDTO;
import com.henrique.escolaidiomas.application.financeiro.usecase.ConsultarPainelFinanceiroUseCase;
import com.henrique.escolaidiomas.application.financeiro.usecase.DarBaixaMensalidadeUseCase;
import com.henrique.escolaidiomas.application.financeiro.usecase.EstornarBaixaMensalidadeUseCase;
import com.henrique.escolaidiomas.application.shared.dto.PaginaDTO;
import com.henrique.escolaidiomas.domain.financeiro.enums.StatusMensalidade;

import lombok.RequiredArgsConstructor;

/** Painel financeiro e baixa manual (gestao — protegido no SecurityConfig). */
@RestController
@RequestMapping("/api/mensalidades")
@RequiredArgsConstructor
public class MensalidadeController {

    private final ConsultarPainelFinanceiroUseCase consultarPainelFinanceiroUseCase;
    private final DarBaixaMensalidadeUseCase darBaixaMensalidadeUseCase;
    private final EstornarBaixaMensalidadeUseCase estornarBaixaMensalidadeUseCase;

    /**
     * RN-12: painel paginado do mes com nomes de aluno/turma (ex.: ?competencia=2026-08),
     * opcionalmente filtrado por {@code situacao} (ABERTA/ATRASADA/PAGA/CANCELADA).
     */
    @GetMapping
    public ResponseEntity<PaginaDTO<MensalidadePainelDTO>> painel(
            @RequestParam String competencia,
            @RequestParam(required = false) StatusMensalidade situacao,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
                consultarPainelFinanceiroUseCase.execute(competencia, situacao, PageRequest.of(page, size)));
    }

    /** US-14: baixa manual (dataPagamento opcional; default hoje). */
    @PostMapping("/{id}/baixa")
    public ResponseEntity<MensalidadeDTO> darBaixa(
            @PathVariable UUID id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataPagamento) {
        return ResponseEntity.ok(darBaixaMensalidadeUseCase.execute(id, dataPagamento));
    }

    /** US-14: estorna a baixa (volta a ABERTA/ATRASADA e limpa a data de pagamento). */
    @PostMapping("/{id}/estornar")
    public ResponseEntity<MensalidadeDTO> estornar(@PathVariable UUID id) {
        return ResponseEntity.ok(estornarBaixaMensalidadeUseCase.execute(id));
    }
}
