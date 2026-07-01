package com.henrique.escolaidiomas.infrastructure.web.matricula.dto;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** Corpo da solicitacao de matricula (US-04). responsavel obrigatorio se menor (RN-18). */
public record SolicitarMatriculaRequest(
        @NotNull(message = "A turma e' obrigatoria.")
        UUID turmaId,

        @NotNull(message = "Os dados do aluno sao obrigatorios.")
        @Valid
        AlunoRequest aluno,

        @Valid
        ResponsavelRequest responsavel
) {
    public record AlunoRequest(
            @NotBlank(message = "O nome do aluno e' obrigatorio.")
            String nome,

            @NotBlank(message = "O e-mail do aluno e' obrigatorio.")
            @Email(message = "Formato de e-mail invalido.")
            String email,

            LocalDate dataNascimento,

            @NotBlank(message = "O CPF do aluno e' obrigatorio.")
            String cpf,

            String rg,
            String telefone,
            String endereco,
            String observacoes
    ) {
    }

    public record ResponsavelRequest(
            String nome,
            String cpf,
            String telefone,
            String email
    ) {
    }
}
