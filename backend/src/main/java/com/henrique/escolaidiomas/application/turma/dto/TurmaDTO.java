package com.henrique.escolaidiomas.application.turma.dto;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.turma.model.Turma;

/** Representacao de leitura de uma turma. */
public record TurmaDTO(
        UUID id,
        UUID professorId,
        String nome,
        String idioma,
        String nivel,
        String diasSemana,
        LocalTime horaInicio,
        LocalTime horaFim,
        BigDecimal valorMensalidade,
        int lotacaoMaxima,
        boolean ativa
) {
    public static TurmaDTO de(Turma t) {
        return new TurmaDTO(
                t.getId(),
                t.getProfessorId(),
                t.getNome(),
                t.getIdioma(),
                t.getNivel(),
                t.getDiasSemana(),
                t.getHoraInicio(),
                t.getHoraFim(),
                t.getValorMensalidade(),
                t.getLotacaoMaxima(),
                t.isAtiva());
    }
}
