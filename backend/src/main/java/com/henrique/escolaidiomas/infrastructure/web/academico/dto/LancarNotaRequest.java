package com.henrique.escolaidiomas.infrastructure.web.academico.dto;

import java.util.UUID;

import com.henrique.escolaidiomas.domain.academico.enums.TipoAvaliacao;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record LancarNotaRequest(
        @NotNull(message = "A matricula e' obrigatoria.")
        UUID matriculaId,

        UUID semestreId,

        @NotNull(message = "O tipo (MIDTERM/FINAL) e' obrigatorio.")
        TipoAvaliacao tipo,

        @Min(value = 0, message = "A nota minima e' 0.")
        @Max(value = 100, message = "A nota maxima e' 100.")
        int nota
) {
}
