package com.henrique.escolaidiomas.infrastructure.web.identity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Corpo da definicao de senha via token (1o acesso RN-39 e recuperacao RN-40). */
public record DefinirSenhaRequest(
        @NotBlank(message = "O token e' obrigatorio.")
        String token,

        @NotBlank(message = "A nova senha e' obrigatoria.")
        @Size(min = 8, message = "A senha deve ter ao menos 8 caracteres.")
        String novaSenha
) {
}
