package com.henrique.escolaidiomas.infrastructure.web.identity.controller;

import java.util.List;
import java.util.Map;
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

import com.henrique.escolaidiomas.application.identity.dto.AtualizarProfessorInput;
import com.henrique.escolaidiomas.application.identity.dto.CadastrarProfessorInput;
import com.henrique.escolaidiomas.application.identity.dto.ProfessorDTO;
import com.henrique.escolaidiomas.application.identity.dto.ProfessorResumoDTO;
import com.henrique.escolaidiomas.application.identity.usecase.AtualizarProfessorUseCase;
import com.henrique.escolaidiomas.application.identity.usecase.CadastrarProfessorUseCase;
import com.henrique.escolaidiomas.application.identity.usecase.ListarProfessoresUseCase;
import com.henrique.escolaidiomas.application.identity.usecase.ReenviarConviteProfessorUseCase;
import com.henrique.escolaidiomas.infrastructure.web.identity.dto.AtualizarProfessorRequest;
import com.henrique.escolaidiomas.infrastructure.web.identity.dto.CadastrarProfessorRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/professores")
@RequiredArgsConstructor
public class ProfessorController {

    private final CadastrarProfessorUseCase cadastrarProfessorUseCase;
    private final AtualizarProfessorUseCase atualizarProfessorUseCase;
    private final ReenviarConviteProfessorUseCase reenviarConviteProfessorUseCase;
    private final ListarProfessoresUseCase listarProfessoresUseCase;

    /** Lista os professores cadastrados (gestao — seletor de turma/repasse e tela de professores). */
    @GetMapping
    public ResponseEntity<List<ProfessorDTO>> listar() {
        return ResponseEntity.ok(listarProfessoresUseCase.execute());
    }

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

    /** Edicao dos dados de um professor pela gestao (protegido por hasRole GESTAO no SecurityConfig). */
    @PutMapping("/{id}")
    public ResponseEntity<ProfessorDTO> atualizar(@PathVariable UUID id,
            @RequestBody @Valid AtualizarProfessorRequest request) {
        AtualizarProfessorInput input = new AtualizarProfessorInput(
                request.nome(),
                request.telefone(),
                request.chavePix(),
                request.dadosBancarios(),
                request.idiomasHabilitados());
        return ResponseEntity.ok(atualizarProfessorUseCase.execute(id, input));
    }

    /** Reenvia o convite de 1o acesso do professor (novo token + e-mail — RN-39). */
    @PostMapping("/{id}/reenviar-convite")
    public ResponseEntity<Map<String, String>> reenviarConvite(@PathVariable UUID id) {
        reenviarConviteProfessorUseCase.execute(id);
        return ResponseEntity.ok(Map.of("mensagem",
                "Convite de 1o acesso reenviado. Um novo link de definicao de senha foi enviado por e-mail."));
    }
}
