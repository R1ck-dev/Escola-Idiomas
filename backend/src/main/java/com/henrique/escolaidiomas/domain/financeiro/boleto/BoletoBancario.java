package com.henrique.escolaidiomas.domain.financeiro.boleto;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Gera o codigo de barras (44 digitos) e a linha digitavel (47 digitos) de um boleto bancario
 * no padrao FEBRABAN, com o valor embutido. Local, sem a API do banco (RN-25, versao simulada):
 * e' um boleto de formato valido — os digitos verificadores (modulo 10/11) e o fator de
 * vencimento sao reais —, mas nao ha registro no banco; a baixa e' manual ou simulada.
 *
 * <p>Codigo de barras (44): banco(3) + moeda(1) + DV geral(1) + fator venc.(4) + valor(10) +
 * campo livre(25). A linha digitavel reordena esses campos em 5 blocos, tres deles com DV
 * proprio (modulo 10), mais o DV geral do codigo de barras (modulo 11).</p>
 */
public final class BoletoBancario {

    private BoletoBancario() {
    }

    private static final String MOEDA_REAL = "9";
    /** Data-base FEBRABAN do fator de vencimento. */
    private static final LocalDate BASE_FATOR = LocalDate.of(1997, 10, 7);

    /** Boleto pronto: as duas representacoes derivadas dos mesmos campos. */
    public record Boleto(String codigoBarras, String linhaDigitavel) {
    }

    /**
     * Monta o boleto de uma cobranca.
     *
     * @param banco      codigo do banco (3 digitos; ex.: "077" = Inter)
     * @param carteira   carteira de cobranca (usada no campo livre; ex.: "1")
     * @param agencia    agencia sem digito (compoe o campo livre)
     * @param conta      conta sem digito (compoe o campo livre)
     * @param nossoNumero identificador da cobranca no banco (deriva da mensalidade; ate 11 digitos)
     * @param vencimento vencimento da cobranca
     * @param valor      valor da cobranca (2 casas; deve ser > 0)
     */
    public static Boleto montar(String banco, String carteira, String agencia, String conta,
            String nossoNumero, LocalDate vencimento, BigDecimal valor) {
        if (valor == null || valor.signum() <= 0) {
            throw new IllegalArgumentException("Valor do boleto deve ser maior que zero.");
        }
        if (vencimento == null) {
            throw new IllegalArgumentException("Vencimento do boleto e' obrigatorio.");
        }

        String bancoFmt = soDigitos(banco, 3);
        String fator = fatorVencimento(vencimento);
        String valorFmt = valorEmCentavos(valor);
        String campoLivre = campoLivre(agencia, conta, carteira, nossoNumero);

        // Codigo de barras sem o DV geral, para calcular o DV (posicao 5).
        String semDv = bancoFmt + MOEDA_REAL + fator + valorFmt + campoLivre;
        String dvGeral = String.valueOf(modulo11Barras(semDv));
        String codigoBarras = bancoFmt + MOEDA_REAL + dvGeral + fator + valorFmt + campoLivre;

        return new Boleto(codigoBarras, linhaDigitavel(codigoBarras));
    }

    /**
     * Fator de vencimento FEBRABAN: dias desde 07/10/1997. Em 22/02/2025 o contador atingiu 9999
     * e reiniciou subtraindo 9000 (mantendo-o em 4 digitos). Aplica o reset quantas vezes precisar.
     */
    private static String fatorVencimento(LocalDate vencimento) {
        long dias = ChronoUnit.DAYS.between(BASE_FATOR, vencimento);
        while (dias > 9999) {
            dias -= 9000;
        }
        if (dias < 0) {
            dias = 0;
        }
        return String.format("%04d", dias);
    }

    /** Valor em centavos, 10 digitos com zeros a esquerda. */
    private static String valorEmCentavos(BigDecimal valor) {
        long centavos = valor.setScale(2, RoundingMode.HALF_UP).movePointRight(2).longValueExact();
        return String.format("%010d", centavos);
    }

    /**
     * Campo livre (25 digitos). Layout simplificado para o boleto simulado: carteira(1) +
     * agencia(4) + conta(7) + nosso numero(11) + "0" de reserva. Nao segue o layout registrado
     * de nenhum banco especifico — so precisa ser deterministico e ter 25 digitos.
     */
    private static String campoLivre(String agencia, String conta, String carteira, String nossoNumero) {
        String bloco = soDigitos(carteira, 1)
                + soDigitos(agencia, 4)
                + soDigitos(conta, 7)
                + soDigitos(nossoNumero, 11)
                + "0";
        return ajustar(bloco, 25);
    }

    /**
     * Linha digitavel (47 digitos) a partir do codigo de barras (44):
     * <ul>
     *   <li>Campo 1: banco(3)+moeda(1)+campoLivre[0..5) → 9 digitos + DV mod10</li>
     *   <li>Campo 2: campoLivre[5..15) → 10 digitos + DV mod10</li>
     *   <li>Campo 3: campoLivre[15..25) → 10 digitos + DV mod10</li>
     *   <li>Campo 4: DV geral do codigo de barras (1 digito)</li>
     *   <li>Campo 5: fator de vencimento(4) + valor(10) → 14 digitos</li>
     * </ul>
     */
    private static String linhaDigitavel(String codigoBarras) {
        String banco = codigoBarras.substring(0, 3);
        String moeda = codigoBarras.substring(3, 4);
        String dvGeral = codigoBarras.substring(4, 5);
        String fatorEValor = codigoBarras.substring(5, 19); // fator(4) + valor(10)
        String campoLivre = codigoBarras.substring(19, 44); // 25 digitos

        String c1 = banco + moeda + campoLivre.substring(0, 5);
        String c2 = campoLivre.substring(5, 15);
        String c3 = campoLivre.substring(15, 25);

        return c1 + modulo10(c1)
                + c2 + modulo10(c2)
                + c3 + modulo10(c3)
                + dvGeral
                + fatorEValor;
    }

    /** DV geral do codigo de barras: modulo 11, pesos 2..9 da direita p/ esquerda; resto 0/1/10 => 1. */
    private static int modulo11Barras(String semDv) {
        int soma = 0;
        int peso = 2;
        for (int i = semDv.length() - 1; i >= 0; i--) {
            soma += (semDv.charAt(i) - '0') * peso;
            peso = (peso == 9) ? 2 : peso + 1;
        }
        int resto = soma % 11;
        int dv = 11 - resto;
        return (dv == 0 || dv == 10 || dv == 11) ? 1 : dv;
    }

    /** DV de campo da linha digitavel: modulo 10, pesos 2,1 alternados da direita; DV = 10-(soma%10). */
    private static int modulo10(String campo) {
        int soma = 0;
        int peso = 2;
        for (int i = campo.length() - 1; i >= 0; i--) {
            int produto = (campo.charAt(i) - '0') * peso;
            soma += (produto > 9) ? (produto - 9) : produto; // soma os digitos do produto
            peso = (peso == 2) ? 1 : 2;
        }
        int dv = 10 - (soma % 10);
        return (dv == 10) ? 0 : dv;
    }

    /** Mantem so digitos e trunca/preenche com zeros a esquerda ate {@code tamanho}. */
    private static String soDigitos(String texto, int tamanho) {
        String d = (texto == null) ? "" : texto.replaceAll("\\D", "");
        return ajustar(d, tamanho);
    }

    /** Trunca pelos ultimos digitos ou completa com zeros a esquerda ate {@code tamanho}. */
    private static String ajustar(String digitos, int tamanho) {
        if (digitos.length() > tamanho) {
            return digitos.substring(digitos.length() - tamanho);
        }
        return "0".repeat(tamanho - digitos.length()) + digitos;
    }
}
