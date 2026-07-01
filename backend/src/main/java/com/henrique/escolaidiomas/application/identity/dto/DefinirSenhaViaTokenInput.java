package com.henrique.escolaidiomas.application.identity.dto;

/** Entrada para consumir um token (1o acesso ou recuperacao) e definir a senha. */
public record DefinirSenhaViaTokenInput(
        String token,
        String novaSenha
) {
}
