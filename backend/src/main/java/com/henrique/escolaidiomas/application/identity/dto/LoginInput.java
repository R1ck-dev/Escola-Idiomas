package com.henrique.escolaidiomas.application.identity.dto;

/** DTO de entrada do caso de uso de autenticacao. */
public record LoginInput(
        String email,
        String password
) {
}
