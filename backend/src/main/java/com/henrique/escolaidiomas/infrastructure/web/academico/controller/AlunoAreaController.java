package com.henrique.escolaidiomas.infrastructure.web.academico.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.henrique.escolaidiomas.application.academico.dto.BoletimDTO;
import com.henrique.escolaidiomas.application.academico.usecase.ConsultarBoletimDoAlunoUseCase;
import com.henrique.escolaidiomas.application.academico.usecase.ListarTurmasDoAlunoUseCase;
import com.henrique.escolaidiomas.application.financeiro.dto.MensalidadeDTO;
import com.henrique.escolaidiomas.application.financeiro.usecase.ConsultarMensalidadesDoAlunoUseCase;
import com.henrique.escolaidiomas.application.turma.dto.TurmaDoAlunoDTO;
import com.henrique.escolaidiomas.infrastructure.config.security.CurrentUserId;

import lombok.RequiredArgsConstructor;

/** US-20/21/22: area do aluno autenticado (protegido no SecurityConfig). */
@RestController
@RequestMapping("/api/alunos/me")
@RequiredArgsConstructor
public class AlunoAreaController {

    private final ListarTurmasDoAlunoUseCase listarTurmasDoAlunoUseCase;
    private final ConsultarBoletimDoAlunoUseCase consultarBoletimDoAlunoUseCase;
    private final ConsultarMensalidadesDoAlunoUseCase consultarMensalidadesDoAlunoUseCase;

    @GetMapping("/turmas")
    public ResponseEntity<List<TurmaDoAlunoDTO>> minhasTurmas(@CurrentUserId UUID alunoId) {
        return ResponseEntity.ok(listarTurmasDoAlunoUseCase.execute(alunoId));
    }

    @GetMapping("/boletim")
    public ResponseEntity<List<BoletimDTO>> meuBoletim(
            @CurrentUserId UUID alunoId,
            @RequestParam(required = false) UUID semestreId) {
        return ResponseEntity.ok(consultarBoletimDoAlunoUseCase.execute(alunoId, semestreId));
    }

    @GetMapping("/mensalidades")
    public ResponseEntity<List<MensalidadeDTO>> minhasMensalidades(@CurrentUserId UUID alunoId) {
        return ResponseEntity.ok(consultarMensalidadesDoAlunoUseCase.execute(alunoId));
    }
}
