package com.henrique.escolaidiomas.infrastructure.web.identity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Corpo do pedido de recuperacao de senha (RN-40). */
public record RecuperarSenhaRequest(
        @NotBlank(message = "O e-mail e' obrigatorio.")
        @Email(message = "Formato de e-mail invalido.")
        String email
) {
}
