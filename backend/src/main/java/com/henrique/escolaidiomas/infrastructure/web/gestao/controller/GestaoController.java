package com.henrique.escolaidiomas.infrastructure.web.gestao.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.henrique.escolaidiomas.application.gestao.dto.DashboardDTO;
import com.henrique.escolaidiomas.application.gestao.usecase.ConsultarDashboardUseCase;
import com.henrique.escolaidiomas.application.turma.dto.TurmaGestaoDTO;
import com.henrique.escolaidiomas.application.turma.usecase.ListarTurmasGestaoUseCase;

import lombok.RequiredArgsConstructor;

/** Paineis agregados da gestao (protegido por /api/gestao/** no SecurityConfig). */
@RestController
@RequestMapping("/api/gestao")
@RequiredArgsConstructor
public class GestaoController {

    private final ConsultarDashboardUseCase consultarDashboardUseCase;
    private final ListarTurmasGestaoUseCase listarTurmasGestaoUseCase;

    /** Inicio da gestao: totais do mes (ex.: ?competencia=2026-07; default mes atual). */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDTO> dashboard(@RequestParam(required = false) String competencia) {
        return ResponseEntity.ok(consultarDashboardUseCase.execute(competencia));
    }

    /** Turmas com nome do professor e ocupacao atual (x/lotacao). */
    @GetMapping("/turmas")
    public ResponseEntity<List<TurmaGestaoDTO>> turmas() {
        return ResponseEntity.ok(listarTurmasGestaoUseCase.execute());
    }
}
