package com.henrique.escolaidiomas.application.turma.dto;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.turma.model.Turma;

/**
 * Visao publica minima de uma turma para o banner da matricula publica (nao autenticada).
 * SEM dados sensiveis: nao expoe professor nem os numeros de lotacao — apenas o
 * sinalizador {@code turmaCheia} para a UI avisar sobre vagas esgotadas (RN-07).
 */
public record TurmaPublicaDTO(
        UUID id,
        String nome,
        String idioma,
        String nivel,
        String diasSemana,
        LocalTime horaInicio,
        LocalTime horaFim,
        BigDecimal valorMensalidade,
        boolean turmaCheia
) {
    public static TurmaPublicaDTO de(Turma t, boolean turmaCheia) {
        return new TurmaPublicaDTO(
                t.getId(),
                t.getNome(),
                t.getIdioma(),
                t.getNivel(),
                t.getDiasSemana(),
                t.getHoraInicio(),
                t.getHoraFim(),
                t.getValorMensalidade(),
                turmaCheia);
    }
}
