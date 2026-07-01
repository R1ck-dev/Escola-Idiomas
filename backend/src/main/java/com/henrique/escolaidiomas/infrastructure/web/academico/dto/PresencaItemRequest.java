package com.henrique.escolaidiomas.infrastructure.web.academico.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record PresencaItemRequest(
        @NotNull(message = "A matricula e' obrigatoria.")
        UUID matriculaId,

        boolean presente
) {
}
