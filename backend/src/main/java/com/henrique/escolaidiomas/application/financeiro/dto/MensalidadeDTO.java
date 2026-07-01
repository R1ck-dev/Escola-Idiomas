package com.henrique.escolaidiomas.application.financeiro.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.financeiro.enums.StatusMensalidade;
import com.henrique.escolaidiomas.domain.financeiro.model.Mensalidade;

/** Visao de uma mensalidade com os valores derivados calculados na data de referencia. */
public record MensalidadeDTO(
        UUID id,
        UUID matriculaId,
        String competencia,
        BigDecimal valorBase,
        int percentual,
        BigDecimal valorEfetivo,
        LocalDate vencimento,
        StatusMensalidade situacao,
        long diasAtraso,
        BigDecimal valorAtualizado,
        boolean prorata,
        LocalDate dataPagamento
) {
    public static MensalidadeDTO de(Mensalidade m, LocalDate hoje) {
        return new MensalidadeDTO(
                m.getId(),
                m.getMatriculaId(),
                m.getCompetencia(),
                m.getValorBase(),
                m.getPercentual(),
                m.getValorEfetivo(),
                m.getVencimento(),
                m.situacaoEm(hoje),
                m.diasAtrasoEm(hoje),
                m.valorAtualizadoEm(hoje),
                m.isProrata(),
                m.getDataPagamento());
    }
}
