package com.henrique.escolaidiomas.infrastructure.web.identity.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.henrique.escolaidiomas.application.identity.dto.MeuPerfilDTO;
import com.henrique.escolaidiomas.application.identity.usecase.BuscarMeuPerfilUseCase;
import com.henrique.escolaidiomas.infrastructure.config.security.CurrentUserId;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final BuscarMeuPerfilUseCase buscarMeuPerfilUseCase;

    @GetMapping("/me")
    public ResponseEntity<MeuPerfilDTO> meuPerfil(@CurrentUserId UUID usuarioId) {
        return ResponseEntity.ok(buscarMeuPerfilUseCase.execute(usuarioId));
    }
}
