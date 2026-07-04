package com.henrique.escolaidiomas.application.financeiro.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.financeiro.enums.StatusMensalidade;
import com.henrique.escolaidiomas.domain.financeiro.model.Mensalidade;

/**
 * Linha do painel financeiro da gestao: a mensalidade com os valores derivados
 * (situacao/multa/mora calculados hoje) mais os nomes de aluno e turma para exibir.
 */
public record MensalidadePainelDTO(
        UUID id,
        UUID matriculaId,
        String alunoNome,
        String turmaNome,
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
    public static MensalidadePainelDTO de(Mensalidade m, String alunoNome, String turmaNome, LocalDate hoje) {
        return new MensalidadePainelDTO(
                m.getId(),
                m.getMatriculaId(),
                alunoNome,
                turmaNome,
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
