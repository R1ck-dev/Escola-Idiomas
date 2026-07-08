package com.henrique.escolaidiomas.application.financeiro.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Dados do recebedor PIX da escola (RN-26). No MVP da Fase 2 a chave e' unica da escola
 * e vem de configuracao (app.pix.*); tornar editavel pela gestao e' evolucao futura.
 *
 * @param chave     chave PIX de recebimento (e-mail, telefone +55..., CPF/CNPJ ou EVP)
 * @param recebedor nome do recebedor no BR Code (max 25 chars apos sanitizacao)
 * @param cidade    cidade do recebedor no BR Code (max 15 chars apos sanitizacao)
 */
@ConfigurationProperties(prefix = "app.pix")
public record PixProperties(
        String chave,
        String recebedor,
        String cidade
) {
}
