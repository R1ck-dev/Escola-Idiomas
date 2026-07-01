package com.henrique.escolaidiomas.infrastructure.web.academico.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.henrique.escolaidiomas.application.academico.dto.AlunoNaTurmaDTO;
import com.henrique.escolaidiomas.application.academico.usecase.ListarAlunosDaTurmaUseCase;
import com.henrique.escolaidiomas.application.academico.usecase.ListarTurmasDoProfessorUseCase;
import com.henrique.escolaidiomas.application.turma.dto.TurmaDTO;
import com.henrique.escolaidiomas.infrastructure.config.security.CurrentUserId;

import lombok.RequiredArgsConstructor;

/** US-17: area do professor autenticado (protegido no SecurityConfig). */
@RestController
@RequestMapping("/api/professores/me")
@RequiredArgsConstructor
public class ProfessorAreaController {

    private final ListarTurmasDoProfessorUseCase listarTurmasDoProfessorUseCase;
    private final ListarAlunosDaTurmaUseCase listarAlunosDaTurmaUseCase;

    @GetMapping("/turmas")
    public ResponseEntity<List<TurmaDTO>> minhasTurmas(@CurrentUserId UUID professorId) {
        return ResponseEntity.ok(listarTurmasDoProfessorUseCase.execute(professorId));
    }

    @GetMapping("/turmas/{turmaId}/alunos")
    public ResponseEntity<List<AlunoNaTurmaDTO>> alunosDaTurma(
            @CurrentUserId UUID professorId, @PathVariable UUID turmaId) {
        return ResponseEntity.ok(listarAlunosDaTurmaUseCase.execute(professorId, turmaId));
    }
}
