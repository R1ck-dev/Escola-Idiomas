package com.henrique.escolaidiomas.application.financeiro.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Dados do beneficiario/conta usados no boleto simulado (RN-25). Sem API do banco: o boleto
 * tem formato FEBRABAN valido, mas nao ha registro real; vem de configuracao (app.boleto.*).
 *
 * @param banco       codigo do banco (3 digitos; ex.: "077" = Inter)
 * @param beneficiario nome do beneficiario (cedente) exibido no boleto
 * @param agencia     agencia sem digito (compoe o campo livre)
 * @param conta       conta sem digito (compoe o campo livre)
 * @param carteira    carteira de cobranca (compoe o campo livre)
 */
@ConfigurationProperties(prefix = "app.boleto")
public record BoletoProperties(
        String banco,
        String beneficiario,
        String agencia,
        String conta,
        String carteira
) {
}
