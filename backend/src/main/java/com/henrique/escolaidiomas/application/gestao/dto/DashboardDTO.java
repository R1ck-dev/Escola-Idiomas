package com.henrique.escolaidiomas.application.gestao.dto;

import java.math.BigDecimal;

/**
 * Sintese da saude financeira do mes para o inicio da gestao (RN-12): totais de
 * recebido, em aberto e em atraso, contagem de inadimplentes e de solicitacoes de
 * matricula aguardando aprovacao (atalhos do dashboard).
 */
public record DashboardDTO(
        String competencia,
        BigDecimal recebido,
        BigDecimal emAberto,
        BigDecimal emAtraso,
        int inadimplentes,
        int totalMensalidades,
        int pagas,
        int solicitacoesPendentes
) {
}
