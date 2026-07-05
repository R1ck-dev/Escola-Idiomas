package com.henrique.escolaidiomas.application.identity.dto;

import java.util.UUID;

import com.henrique.escolaidiomas.domain.identity.model.Aluno;

/** Leitura minima de um aluno para o seletor/busca do header da gestao. */
public record AlunoBuscaDTO(
        UUID id,
        String nome,
        String email
) {
    public static AlunoBuscaDTO de(Aluno a) {
        return new AlunoBuscaDTO(a.getId(), a.getNome(), a.getEmail());
    }
}
