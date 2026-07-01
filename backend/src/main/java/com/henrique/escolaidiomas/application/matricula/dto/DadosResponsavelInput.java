package com.henrique.escolaidiomas.application.matricula.dto;

/** Dados do responsavel financeiro (obrigatorios para aluno menor — RN-18). */
public record DadosResponsavelInput(
        String nome,
        String cpf,
        String telefone,
        String email
) {
}
