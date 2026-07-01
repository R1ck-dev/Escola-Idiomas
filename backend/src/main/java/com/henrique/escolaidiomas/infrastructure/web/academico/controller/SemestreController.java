package com.henrique.escolaidiomas.infrastructure.web.academico.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.henrique.escolaidiomas.application.academico.dto.CriarSemestreInput;
import com.henrique.escolaidiomas.application.academico.dto.SemestreDTO;
import com.henrique.escolaidiomas.application.academico.usecase.CriarSemestreUseCase;
import com.henrique.escolaidiomas.application.academico.usecase.ListarSemestresUseCase;
import com.henrique.escolaidiomas.infrastructure.web.academico.dto.CriarSemestreRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/** Semestre letivo (gestao — protegido no SecurityConfig). */
@RestController
@RequestMapping("/api/semestres")
@RequiredArgsConstructor
public class SemestreController {

    private final CriarSemestreUseCase criarSemestreUseCase;
    private final ListarSemestresUseCase listarSemestresUseCase;

    @PostMapping
    public ResponseEntity<SemestreDTO> criar(@RequestBody @Valid CriarSemestreRequest request) {
        CriarSemestreInput input = new CriarSemestreInput(
                request.referencia(), request.dataInicio(), request.dataFim());
        return ResponseEntity.status(HttpStatus.CREATED).body(criarSemestreUseCase.execute(input));
    }

    @GetMapping
    public ResponseEntity<List<SemestreDTO>> listar() {
        return ResponseEntity.ok(listarSemestresUseCase.execute());
    }
}
