package com.henrique.escolaidiomas.infrastructure.web.identity.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.henrique.escolaidiomas.application.identity.dto.CadastrarProfessorInput;
import com.henrique.escolaidiomas.application.identity.dto.ProfessorResumoDTO;
import com.henrique.escolaidiomas.application.identity.usecase.CadastrarProfessorUseCase;
import com.henrique.escolaidiomas.infrastructure.web.identity.dto.CadastrarProfessorRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/professores")
@RequiredArgsConstructor
public class ProfessorController {

    private final CadastrarProfessorUseCase cadastrarProfessorUseCase;

    /** Cadastro de professor pela gestao (protegido por hasRole GESTAO no SecurityConfig). */
    @PostMapping
    public ResponseEntity<ProfessorResumoDTO> cadastrar(@RequestBody @Valid CadastrarProfessorRequest request) {
        CadastrarProfessorInput input = new CadastrarProfessorInput(
                request.nome(),
                request.email(),
                request.cpf(),
                request.rg(),
                request.telefone(),
                request.chavePix(),
                request.dadosBancarios(),
                request.idiomasHabilitados());

        ProfessorResumoDTO dto = cadastrarProfessorUseCase.execute(input);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }
}
