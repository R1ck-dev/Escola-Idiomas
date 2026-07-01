package com.henrique.escolaidiomas.infrastructure.web.academico.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record RegistrarChamadaRequest(
        @NotNull(message = "A turma e' obrigatoria.")
        UUID turmaId,

        LocalDate data,

        @NotEmpty(message = "Informe ao menos uma presenca.")
        @Valid
        List<PresencaItemRequest> presencas
) {
}
