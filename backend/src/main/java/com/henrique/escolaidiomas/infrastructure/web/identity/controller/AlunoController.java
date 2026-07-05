package com.henrique.escolaidiomas.infrastructure.web.identity.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.henrique.escolaidiomas.application.identity.dto.AlunoBuscaDTO;
import com.henrique.escolaidiomas.application.identity.usecase.BuscarAlunosUseCase;

import lombok.RequiredArgsConstructor;

/** Busca de alunos para o header/seletor da gestao (protegido por GET /api/alunos -> GESTAO no SecurityConfig). */
@RestController
@RequestMapping("/api/alunos")
@RequiredArgsConstructor
public class AlunoController {

    private final BuscarAlunosUseCase buscarAlunosUseCase;

    /**
     * Busca alunos por nome ou e-mail (case-insensitive), ate ~20 resultados.
     * {@code q} vazio/ausente retorna os primeiros alunos por nome.
     */
    @GetMapping
    public ResponseEntity<List<AlunoBuscaDTO>> buscar(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(buscarAlunosUseCase.execute(q));
    }
}
