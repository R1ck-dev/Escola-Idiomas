package com.henrique.escolaidiomas.application.matricula.dto;

import java.time.LocalDate;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.matricula.enums.StatusMatricula;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;

public record MatriculaDTO(
        UUID id,
        UUID alunoId,
        UUID turmaId,
        LocalDate dataMatricula,
        StatusMatricula status,
        String motivoRejeicao
) {
    public static MatriculaDTO de(Matricula m) {
        return new MatriculaDTO(
                m.getId(),
                m.getAlunoId(),
                m.getTurmaId(),
                m.getDataMatricula(),
                m.getStatus(),
                m.getMotivoRejeicao());
    }
}
