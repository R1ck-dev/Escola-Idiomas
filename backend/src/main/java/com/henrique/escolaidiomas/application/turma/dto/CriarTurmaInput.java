package com.henrique.escolaidiomas.application.turma.dto;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;

/** Entrada de criacao de turma. lotacaoMaxima nula assume o padrao (12). */
public record CriarTurmaInput(
        UUID professorId,
        String nome,
        String idioma,
        String nivel,
        String diasSemana,
        LocalTime horaInicio,
        LocalTime horaFim,
        BigDecimal valorMensalidade,
        Integer lotacaoMaxima
) {
}
