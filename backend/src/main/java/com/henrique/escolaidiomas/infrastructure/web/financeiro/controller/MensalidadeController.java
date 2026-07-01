package com.henrique.escolaidiomas.infrastructure.web.financeiro.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.henrique.escolaidiomas.application.financeiro.dto.MensalidadeDTO;
import com.henrique.escolaidiomas.application.financeiro.usecase.ConsultarPainelFinanceiroUseCase;
import com.henrique.escolaidiomas.application.financeiro.usecase.DarBaixaMensalidadeUseCase;

import lombok.RequiredArgsConstructor;

/** Painel financeiro e baixa manual (gestao — protegido no SecurityConfig). */
@RestController
@RequestMapping("/api/mensalidades")
@RequiredArgsConstructor
public class MensalidadeController {

    private final ConsultarPainelFinanceiroUseCase consultarPainelFinanceiroUseCase;
    private final DarBaixaMensalidadeUseCase darBaixaMensalidadeUseCase;

    /** RN-12: painel do mes (ex.: ?competencia=2026-08). */
    @GetMapping
    public ResponseEntity<List<MensalidadeDTO>> painel(@RequestParam String competencia) {
        return ResponseEntity.ok(consultarPainelFinanceiroUseCase.execute(competencia));
    }

    /** US-14: baixa manual (dataPagamento opcional; default hoje). */
    @PostMapping("/{id}/baixa")
    public ResponseEntity<MensalidadeDTO> darBaixa(
            @PathVariable UUID id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataPagamento) {
        return ResponseEntity.ok(darBaixaMensalidadeUseCase.execute(id, dataPagamento));
    }
}
