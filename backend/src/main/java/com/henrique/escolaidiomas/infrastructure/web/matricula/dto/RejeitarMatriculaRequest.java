package com.henrique.escolaidiomas.infrastructure.web.matricula.dto;

import jakarta.validation.constraints.NotBlank;

public record RejeitarMatriculaRequest(
        @NotBlank(message = "Informe o motivo da rejeicao.")
        String motivo
) {
}
