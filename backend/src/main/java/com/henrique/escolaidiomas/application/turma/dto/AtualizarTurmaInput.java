package com.henrique.escolaidiomas.application.turma.dto;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;

/** Entrada de atualizacao de turma (inclui ativar/desativar). */
public record AtualizarTurmaInput(
        UUID turmaId,
        UUID professorId,
        String nome,
        String idioma,
        String nivel,
        String diasSemana,
        LocalTime horaInicio,
        LocalTime horaFim,
        BigDecimal valorMensalidade,
        Integer lotacaoMaxima,
        boolean ativa
) {
}
