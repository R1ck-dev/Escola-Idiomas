package com.henrique.escolaidiomas.application.identity.dto;

import java.util.UUID;

import com.henrique.escolaidiomas.domain.identity.enums.StatusUsuario;
import com.henrique.escolaidiomas.domain.identity.model.Professor;

/** Leitura de um professor para a listagem da gestao (seletor de turma/repasse e tela de professores). */
public record ProfessorDTO(
        UUID id,
        String nome,
        String email,
        StatusUsuario status,
        String telefone,
        String idiomasHabilitados
) {
    public static ProfessorDTO de(Professor p) {
        return new ProfessorDTO(
                p.getId(),
                p.getNome(),
                p.getEmail(),
                p.getStatus(),
                p.getTelefone(),
                p.getIdiomasHabilitados());
    }
}
