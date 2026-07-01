package com.henrique.escolaidiomas.application.financeiro.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.financeiro.enums.CategoriaDespesa;

public record RegistrarDespesaInput(
        String descricao,
        CategoriaDespesa categoria,
        BigDecimal valor,
        LocalDate data,
        UUID professorId
) {
}
