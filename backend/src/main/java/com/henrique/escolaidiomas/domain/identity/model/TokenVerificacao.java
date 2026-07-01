package com.henrique.escolaidiomas.domain.identity.model;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.identity.enums.TipoToken;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

/**
 * Token de uso unico enviado por e-mail. Sustenta o 1o acesso (RN-39) e a
 * recuperacao de senha (RN-40). Expira em 24h e so pode ser usado uma vez.
 */
public class TokenVerificacao {

    private UUID id;
    private Usuario usuario;
    private String token;
    private OffsetDateTime dataExpiracao;
    private boolean utilizado;
    private TipoToken tipo;

    /** Construtor de criacao: gera token aleatorio valido por 24h. */
    public TokenVerificacao(Usuario usuario, TipoToken tipo) {
        this.id = UUID.randomUUID();
        this.usuario = usuario;
        this.token = UUID.randomUUID().toString();
        this.dataExpiracao = OffsetDateTime.now().plusHours(24);
        this.utilizado = false;
        this.tipo = tipo;
    }

    /** Construtor de reconstituicao. */
    public TokenVerificacao(UUID id, Usuario usuario, String token, OffsetDateTime dataExpiracao,
            boolean utilizado, TipoToken tipo) {
        this.id = id;
        this.usuario = usuario;
        this.token = token;
        this.dataExpiracao = dataExpiracao;
        this.utilizado = utilizado;
        this.tipo = tipo;
    }

    /** Garante que o token ainda pode ser consumido. */
    public void validar() {
        if (this.utilizado) {
            throw new NegocioException("Este link de verificacao ja foi utilizado.");
        }
        if (OffsetDateTime.now().isAfter(this.dataExpiracao)) {
            throw new NegocioException("Este link de verificacao expirou. Solicite um novo.");
        }
    }

    public void marcarComoUtilizado() {
        this.utilizado = true;
    }

    public UUID getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public String getToken() {
        return token;
    }

    public OffsetDateTime getDataExpiracao() {
        return dataExpiracao;
    }

    public boolean isUtilizado() {
        return utilizado;
    }

    public TipoToken getTipo() {
        return tipo;
    }
}
