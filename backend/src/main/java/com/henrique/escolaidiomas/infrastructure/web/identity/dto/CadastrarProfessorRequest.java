package com.henrique.escolaidiomas.infrastructure.web.identity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Corpo do cadastro de professor pela gestao (RN-04). Sem senha (1o acesso por e-mail). */
public record CadastrarProfessorRequest(
        @NotBlank(message = "O nome e' obrigatorio.")
        String nome,

        @NotBlank(message = "O e-mail e' obrigatorio.")
        @Email(message = "Formato de e-mail invalido.")
        String email,

        @NotBlank(message = "O CPF e' obrigatorio.")
        String cpf,

        String rg,
        String telefone,
        String chavePix,
        String dadosBancarios,
        String idiomasHabilitados
) {
}
