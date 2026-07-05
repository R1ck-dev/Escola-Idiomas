package com.henrique.escolaidiomas.infrastructure.web.identity.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.henrique.escolaidiomas.application.identity.dto.AlunoBuscaDTO;
import com.henrique.escolaidiomas.application.identity.dto.AlunoDetalheDTO;
import com.henrique.escolaidiomas.application.identity.usecase.BuscarAlunoDetalheUseCase;
import com.henrique.escolaidiomas.application.identity.usecase.BuscarAlunosUseCase;

import lombok.RequiredArgsConstructor;

/** Busca e detalhe de alunos para a gestao (protegido por /api/alunos[/*] -> GESTAO no SecurityConfig). */
@RestController
@RequestMapping("/api/alunos")
@RequiredArgsConstructor
public class AlunoController {

    private final BuscarAlunosUseCase buscarAlunosUseCase;
    private final BuscarAlunoDetalheUseCase buscarAlunoDetalheUseCase;

    /**
     * Busca alunos por nome ou e-mail (case-insensitive), ate ~20 resultados.
     * {@code q} vazio/ausente retorna os primeiros alunos por nome.
     */
    @GetMapping
    public ResponseEntity<List<AlunoBuscaDTO>> buscar(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(buscarAlunosUseCase.execute(q));
    }

    /** Detalhe do aluno (dados, responsavel, turmas, mensalidades e boletim). */
    @GetMapping("/{id}")
    public ResponseEntity<AlunoDetalheDTO> detalhe(@PathVariable UUID id) {
        return ResponseEntity.ok(buscarAlunoDetalheUseCase.execute(id));
    }
}
