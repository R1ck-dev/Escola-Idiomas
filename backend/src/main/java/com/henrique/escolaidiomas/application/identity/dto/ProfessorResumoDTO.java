package com.henrique.escolaidiomas.application.identity.dto;

import java.util.UUID;

import com.henrique.escolaidiomas.domain.identity.enums.StatusUsuario;

/** Confirmacao do cadastro de professor. */
public record ProfessorResumoDTO(
        UUID id,
        String nome,
        String email,
        StatusUsuario status
) {
}
