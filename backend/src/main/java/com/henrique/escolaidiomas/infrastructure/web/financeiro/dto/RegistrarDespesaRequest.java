package com.henrique.escolaidiomas.infrastructure.web.financeiro.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.financeiro.enums.CategoriaDespesa;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record RegistrarDespesaRequest(
        @NotBlank(message = "A descricao e' obrigatoria.")
        String descricao,

        @NotNull(message = "A categoria e' obrigatoria.")
        CategoriaDespesa categoria,

        @NotNull(message = "O valor e' obrigatorio.")
        @Positive(message = "O valor deve ser maior que zero.")
        BigDecimal valor,

        LocalDate data,
        UUID professorId
) {
}
