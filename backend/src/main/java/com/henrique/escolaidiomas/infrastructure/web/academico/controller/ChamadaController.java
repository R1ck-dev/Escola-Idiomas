package com.henrique.escolaidiomas.infrastructure.web.academico.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.henrique.escolaidiomas.application.academico.dto.ChamadaDTO;
import com.henrique.escolaidiomas.application.academico.dto.MarcarPresencaInput;
import com.henrique.escolaidiomas.application.academico.dto.RegistrarChamadaInput;
import com.henrique.escolaidiomas.application.academico.usecase.ConsultarChamadaUseCase;
import com.henrique.escolaidiomas.application.academico.usecase.ListarDatasComChamadaUseCase;
import com.henrique.escolaidiomas.application.academico.usecase.RegistrarChamadaUseCase;
import com.henrique.escolaidiomas.infrastructure.config.security.CurrentUserId;
import com.henrique.escolaidiomas.infrastructure.web.academico.dto.RegistrarChamadaRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/** US-18 / RN-35: chamada por dia de aula (professor — protegido no SecurityConfig). */
@RestController
@RequestMapping("/api/chamadas")
@RequiredArgsConstructor
public class ChamadaController {

    private final RegistrarChamadaUseCase registrarChamadaUseCase;
    private final ConsultarChamadaUseCase consultarChamadaUseCase;
    private final ListarDatasComChamadaUseCase listarDatasComChamadaUseCase;

    @PostMapping
    public ResponseEntity<ChamadaDTO> registrar(
            @CurrentUserId UUID professorId,
            @RequestBody @Valid RegistrarChamadaRequest request) {
        RegistrarChamadaInput input = new RegistrarChamadaInput(
                request.turmaId(), request.data(),
                request.presencas().stream()
                        .map(p -> new MarcarPresencaInput(p.matriculaId(), p.presente()))
                        .toList());
        return ResponseEntity.ok(registrarChamadaUseCase.execute(professorId, input));
    }

    /** Lista de chamada de um dia (default hoje). */
    @GetMapping
    public ResponseEntity<ChamadaDTO> consultar(
            @CurrentUserId UUID professorId,
            @RequestParam UUID turmaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return ResponseEntity.ok(consultarChamadaUseCase.execute(professorId, turmaId, data));
    }

    /** Datas ja com chamada aberta na turma (navegacao ◀/▶ da chamada). */
    @GetMapping("/datas")
    public ResponseEntity<List<LocalDate>> datas(
            @CurrentUserId UUID professorId,
            @RequestParam UUID turmaId) {
        return ResponseEntity.ok(listarDatasComChamadaUseCase.execute(professorId, turmaId));
    }
}
