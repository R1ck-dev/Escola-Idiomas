package com.henrique.escolaidiomas.application.financeiro.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.financeiro.enums.CategoriaDespesa;
import com.henrique.escolaidiomas.domain.financeiro.model.Despesa;

public record DespesaDTO(
        UUID id,
        String descricao,
        CategoriaDespesa categoria,
        BigDecimal valor,
        LocalDate data,
        UUID professorId
) {
    public static DespesaDTO de(Despesa d) {
        return new DespesaDTO(d.getId(), d.getDescricao(), d.getCategoria(),
                d.getValor(), d.getData(), d.getProfessorId());
    }
}
