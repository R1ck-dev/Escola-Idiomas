package com.henrique.escolaidiomas.application.financeiro.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Cobranca PIX de uma mensalidade (RN-26): o "copia e cola" (BR Code) com o valor embutido,
 * mais os dados para exibir na tela. O QR e' renderizado no cliente a partir de {@code copiaECola}.
 */
public record PixCobrancaDTO(
        UUID mensalidadeId,
        String competencia,
        LocalDate vencimento,
        BigDecimal valor,
        String recebedor,
        String chave,
        String copiaECola
) {
}
