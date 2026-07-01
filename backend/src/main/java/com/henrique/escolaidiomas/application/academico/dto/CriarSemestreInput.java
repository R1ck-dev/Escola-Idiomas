package com.henrique.escolaidiomas.application.academico.dto;

import java.time.LocalDate;

public record CriarSemestreInput(
        String referencia,
        LocalDate dataInicio,
        LocalDate dataFim
) {
}
