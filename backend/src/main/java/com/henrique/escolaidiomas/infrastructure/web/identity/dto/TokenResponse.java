package com.henrique.escolaidiomas.infrastructure.web.identity.dto;

/** Resposta do login: o JWT e o esquema de uso (Bearer). */
public record TokenResponse(
        String token,
        String tipo
) {
    public TokenResponse(String token) {
        this(token, "Bearer");
    }
}
