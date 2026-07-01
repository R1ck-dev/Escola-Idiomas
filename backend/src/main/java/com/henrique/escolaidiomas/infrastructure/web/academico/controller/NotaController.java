package com.henrique.escolaidiomas.infrastructure.web.academico.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.henrique.escolaidiomas.application.academico.dto.AvaliacaoDTO;
import com.henrique.escolaidiomas.application.academico.dto.LancarNotaInput;
import com.henrique.escolaidiomas.application.academico.usecase.LancarNotaUseCase;
import com.henrique.escolaidiomas.infrastructure.config.security.CurrentUserId;
import com.henrique.escolaidiomas.infrastructure.web.academico.dto.LancarNotaRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/** US-19 / RN-31: lancamento de notas (professor — protegido no SecurityConfig). */
@RestController
@RequestMapping("/api/notas")
@RequiredArgsConstructor
public class NotaController {

    private final LancarNotaUseCase lancarNotaUseCase;

    @PostMapping
    public ResponseEntity<AvaliacaoDTO> lancar(
            @CurrentUserId UUID professorId,
            @RequestBody @Valid LancarNotaRequest request) {
        LancarNotaInput input = new LancarNotaInput(
                request.matriculaId(), request.semestreId(), request.tipo(), request.nota());
        return ResponseEntity.status(HttpStatus.CREATED).body(lancarNotaUseCase.execute(professorId, input));
    }
}
