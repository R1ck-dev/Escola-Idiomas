package com.henrique.escolaidiomas.infrastructure.web.turma.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.henrique.escolaidiomas.application.turma.dto.AtualizarTurmaInput;
import com.henrique.escolaidiomas.application.turma.dto.CriarTurmaInput;
import com.henrique.escolaidiomas.application.turma.dto.TurmaDTO;
import com.henrique.escolaidiomas.application.turma.usecase.AtualizarTurmaUseCase;
import com.henrique.escolaidiomas.application.turma.usecase.BuscarTurmaUseCase;
import com.henrique.escolaidiomas.application.turma.usecase.CriarTurmaUseCase;
import com.henrique.escolaidiomas.application.turma.usecase.ListarTurmasUseCase;
import com.henrique.escolaidiomas.infrastructure.web.turma.dto.AtualizarTurmaRequest;
import com.henrique.escolaidiomas.infrastructure.web.turma.dto.CriarTurmaRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/turmas")
@RequiredArgsConstructor
public class TurmaController {

    private final CriarTurmaUseCase criarTurmaUseCase;
    private final AtualizarTurmaUseCase atualizarTurmaUseCase;
    private final ListarTurmasUseCase listarTurmasUseCase;
    private final BuscarTurmaUseCase buscarTurmaUseCase;

    /** Criacao pela gestao (protegido no SecurityConfig). */
    @PostMapping
    public ResponseEntity<TurmaDTO> criar(@RequestBody @Valid CriarTurmaRequest request) {
        CriarTurmaInput input = new CriarTurmaInput(
                request.professorId(), request.nome(), request.idioma(), request.nivel(),
                request.diasSemana(), request.horaInicio(), request.horaFim(),
                request.valorMensalidade(), request.lotacaoMaxima());
        return ResponseEntity.status(HttpStatus.CREATED).body(criarTurmaUseCase.execute(input));
    }

    @GetMapping
    public ResponseEntity<List<TurmaDTO>> listar() {
        return ResponseEntity.ok(listarTurmasUseCase.execute());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TurmaDTO> buscar(@PathVariable UUID id) {
        return ResponseEntity.ok(buscarTurmaUseCase.execute(id));
    }

    /** Edicao pela gestao (protegido no SecurityConfig). */
    @PutMapping("/{id}")
    public ResponseEntity<TurmaDTO> atualizar(@PathVariable UUID id, @RequestBody @Valid AtualizarTurmaRequest request) {
        AtualizarTurmaInput input = new AtualizarTurmaInput(
                id, request.professorId(), request.nome(), request.idioma(), request.nivel(),
                request.diasSemana(), request.horaInicio(), request.horaFim(),
                request.valorMensalidade(), request.lotacaoMaxima(),
                request.ativa() == null ? true : request.ativa());
        return ResponseEntity.ok(atualizarTurmaUseCase.execute(input));
    }
}
