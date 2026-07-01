package com.henrique.escolaidiomas.infrastructure.web.academico.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CriarSemestreRequest(
        @NotBlank(message = "A referencia e' obrigatoria (ex.: 2026-2).")
        String referencia,

        @NotNull(message = "A data de inicio e' obrigatoria.")
        LocalDate dataInicio,

        @NotNull(message = "A data de fim e' obrigatoria.")
        LocalDate dataFim
) {
}
