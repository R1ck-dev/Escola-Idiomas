package com.henrique.escolaidiomas.infrastructure.web.identity.dto;

import jakarta.validation.constraints.NotBlank;

/** Corpo da edicao de professor pela gestao (RN-04). E-mail/CPF/RG nao sao editaveis. */
public record AtualizarProfessorRequest(
        @NotBlank(message = "O nome e' obrigatorio.")
        String nome,

        String telefone,
        String chavePix,
        String dadosBancarios,
        String idiomasHabilitados
) {
}
