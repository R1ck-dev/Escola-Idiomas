package com.henrique.escolaidiomas.infrastructure.web.financeiro.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.henrique.escolaidiomas.application.financeiro.dto.DespesaDTO;
import com.henrique.escolaidiomas.application.financeiro.dto.RegistrarDespesaInput;
import com.henrique.escolaidiomas.application.financeiro.usecase.AtualizarDespesaUseCase;
import com.henrique.escolaidiomas.application.financeiro.usecase.ExcluirDespesaUseCase;
import com.henrique.escolaidiomas.application.financeiro.usecase.ListarDespesasUseCase;
import com.henrique.escolaidiomas.application.financeiro.usecase.RegistrarDespesaUseCase;
import com.henrique.escolaidiomas.infrastructure.web.financeiro.dto.RegistrarDespesaRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/** US-16: saidas do caixa (gestao — protegido no SecurityConfig). */
@RestController
@RequestMapping("/api/despesas")
@RequiredArgsConstructor
public class DespesaController {

    private final RegistrarDespesaUseCase registrarDespesaUseCase;
    private final AtualizarDespesaUseCase atualizarDespesaUseCase;
    private final ExcluirDespesaUseCase excluirDespesaUseCase;
    private final ListarDespesasUseCase listarDespesasUseCase;

    @PostMapping
    public ResponseEntity<DespesaDTO> registrar(@RequestBody @Valid RegistrarDespesaRequest request) {
        RegistrarDespesaInput input = new RegistrarDespesaInput(
                request.descricao(), request.categoria(), request.valor(), request.data(), request.professorId());
        return ResponseEntity.status(HttpStatus.CREATED).body(registrarDespesaUseCase.execute(input));
    }

    /** Extrato do mes (ex.: ?competencia=2026-07). */
    @GetMapping
    public ResponseEntity<List<DespesaDTO>> listar(@RequestParam String competencia) {
        return ResponseEntity.ok(listarDespesasUseCase.execute(competencia));
    }

    /** Edicao de uma despesa (gestao). */
    @PutMapping("/{id}")
    public ResponseEntity<DespesaDTO> atualizar(@PathVariable UUID id, @RequestBody @Valid RegistrarDespesaRequest request) {
        RegistrarDespesaInput input = new RegistrarDespesaInput(
                request.descricao(), request.categoria(), request.valor(), request.data(), request.professorId());
        return ResponseEntity.ok(atualizarDespesaUseCase.execute(id, input));
    }

    /** Exclusao de uma despesa (gestao). */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        excluirDespesaUseCase.execute(id);
        return ResponseEntity.noContent().build();
    }
}
