package com.henrique.escolaidiomas.infrastructure.web.academico.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.henrique.escolaidiomas.application.academico.dto.BoletimDTO;
import com.henrique.escolaidiomas.application.academico.usecase.ApurarBoletimUseCase;

import lombok.RequiredArgsConstructor;

/** US-24: apuracao de um boletim (gestao/professor — protegido no SecurityConfig). */
@RestController
@RequestMapping("/api/boletins")
@RequiredArgsConstructor
public class BoletimController {

    private final ApurarBoletimUseCase apurarBoletimUseCase;

    @GetMapping
    public ResponseEntity<BoletimDTO> apurar(
            @RequestParam UUID matriculaId,
            @RequestParam(required = false) UUID semestreId) {
        return ResponseEntity.ok(apurarBoletimUseCase.execute(matriculaId, semestreId));
    }
}
