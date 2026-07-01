package com.henrique.escolaidiomas.application.matricula.dto;

import java.time.LocalDate;

/** Dados do aluno na solicitacao de matricula. */
public record DadosAlunoInput(
        String nome,
        String email,
        LocalDate dataNascimento,
        String cpf,
        String rg,
        String telefone,
        String endereco,
        String observacoes
) {
}
