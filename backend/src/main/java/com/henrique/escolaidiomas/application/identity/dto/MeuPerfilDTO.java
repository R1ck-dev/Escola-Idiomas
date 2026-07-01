package com.henrique.escolaidiomas.application.identity.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.identity.enums.Role;
import com.henrique.escolaidiomas.domain.identity.enums.StatusUsuario;

/**
 * Dados do usuario autenticado (endpoint /me). Nesta fatia expoe apenas os campos
 * comuns; campos especificos de subtipo entram quando Aluno/Professor forem criados.
 */
public record MeuPerfilDTO(
        UUID id,
        String nome,
        String email,
        Role role,
        StatusUsuario status,
        OffsetDateTime criadoEm
) {
}
