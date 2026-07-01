package com.henrique.escolaidiomas.infrastructure.web.turma.dto;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CriarTurmaRequest(
        @NotNull(message = "O professor responsavel e' obrigatorio.")
        UUID professorId,

        @NotBlank(message = "O nome da turma e' obrigatorio.")
        String nome,

        @NotBlank(message = "O idioma e' obrigatorio.")
        String idioma,

        String nivel,
        String diasSemana,
        LocalTime horaInicio,
        LocalTime horaFim,

        @NotNull(message = "O valor da mensalidade e' obrigatorio.")
        @Positive(message = "O valor da mensalidade deve ser maior que zero.")
        BigDecimal valorMensalidade,

        Integer lotacaoMaxima
) {
}
