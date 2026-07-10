package com.henrique.escolaidiomas.application.financeiro.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Boleto de uma mensalidade (RN-25, simulado): a linha digitavel e o codigo de barras (44 digitos),
 * com o valor embutido, mais os dados para exibir/renderizar. O desenho das barras (Interleaved
 * 2 of 5) e' feito no cliente a partir de {@code codigoBarras}.
 */
public record BoletoCobrancaDTO(
        UUID mensalidadeId,
        String competencia,
        LocalDate vencimento,
        BigDecimal valor,
        String beneficiario,
        String nossoNumero,
        String linhaDigitavel,
        String codigoBarras
) {
}
