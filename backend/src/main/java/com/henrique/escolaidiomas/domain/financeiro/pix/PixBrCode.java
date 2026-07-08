package com.henrique.escolaidiomas.domain.financeiro.pix;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;

/**
 * Gera o payload "copia e cola" do PIX (BR Code / EMV MPM do BACEN) com o valor embutido
 * (RN-26). Local, sem PSP: e' um PIX estatico com valor fixo — a confirmacao do pagamento
 * e' manual ou simulada (nao ha txid dinamico de banco).
 *
 * <p>Formato: campos TLV {@code ID(2) + tamanho(2) + valor}, em ordem crescente de ID,
 * terminando no campo 63 (CRC16-CCITT/FALSE sobre tudo, inclusive "6304").</p>
 */
public final class PixBrCode {

    private PixBrCode() {
    }

    private static final String GUI_PIX = "br.gov.bcb.pix";
    private static final String TXID_ESTATICO = "***"; // sem txid dinamico (PIX estatico)

    /**
     * Monta o BR Code para uma cobranca.
     *
     * @param chave     chave PIX do recebedor (e-mail, telefone, CPF/CNPJ ou EVP)
     * @param recebedor nome do recebedor (sanitizado e truncado em 25 chars)
     * @param cidade    cidade do recebedor (sanitizada e truncada em 15 chars)
     * @param valor     valor da cobranca (2 casas; deve ser > 0)
     * @return string do "pix copia e cola"
     */
    public static String montar(String chave, String recebedor, String cidade, BigDecimal valor) {
        if (chave == null || chave.isBlank()) {
            throw new IllegalArgumentException("Chave PIX nao configurada.");
        }
        if (valor == null || valor.signum() <= 0) {
            throw new IllegalArgumentException("Valor do PIX deve ser maior que zero.");
        }

        String contaPix = tlv("00", GUI_PIX) + tlv("01", chave.trim());
        String valorFmt = valor.setScale(2, RoundingMode.HALF_UP).toPlainString();

        StringBuilder sb = new StringBuilder()
                .append(tlv("00", "01"))                                   // Payload Format Indicator
                .append(tlv("26", contaPix))                               // Merchant Account Info (PIX)
                .append(tlv("52", "0000"))                                 // Merchant Category Code
                .append(tlv("53", "986"))                                  // Moeda (BRL)
                .append(tlv("54", valorFmt))                               // Valor da transacao
                .append(tlv("58", "BR"))                                   // Pais
                .append(tlv("59", sanitizar(recebedor, 25)))               // Nome do recebedor
                .append(tlv("60", sanitizar(cidade, 15)))                  // Cidade do recebedor
                .append(tlv("62", tlv("05", TXID_ESTATICO)));              // Additional Data (txid)

        sb.append("6304");                                                 // ID+len do CRC, entram no calculo
        sb.append(crc16(sb.toString()));
        return sb.toString();
    }

    /** Campo TLV: id + tamanho (2 digitos) + valor. */
    private static String tlv(String id, String valor) {
        return id + String.format("%02d", valor.length()) + valor;
    }

    /** Remove acentos/caracteres nao-ASCII, colapsa espacos e trunca (nome/cidade do BR Code). */
    private static String sanitizar(String texto, int max) {
        String base = (texto == null || texto.isBlank()) ? "NA" : texto;
        String semAcento = Normalizer.normalize(base, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replaceAll("[^\\x20-\\x7E]", "")
                .replaceAll("\\s+", " ")
                .trim();
        if (semAcento.isEmpty()) {
            semAcento = "NA";
        }
        return semAcento.length() > max ? semAcento.substring(0, max).trim() : semAcento;
    }

    /** CRC16-CCITT (FALSE): poly 0x1021, init 0xFFFF, sem reflexao — 4 digitos hex maiusculos. */
    private static String crc16(String payload) {
        int crc = 0xFFFF;
        for (byte b : payload.getBytes(java.nio.charset.StandardCharsets.UTF_8)) {
            crc ^= (b & 0xFF) << 8;
            for (int i = 0; i < 8; i++) {
                crc = ((crc & 0x8000) != 0) ? (crc << 1) ^ 0x1021 : (crc << 1);
                crc &= 0xFFFF;
            }
        }
        return String.format("%04X", crc);
    }
}
