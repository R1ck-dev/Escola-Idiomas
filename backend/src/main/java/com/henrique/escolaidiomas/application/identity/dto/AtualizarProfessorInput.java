package com.henrique.escolaidiomas.application.identity.dto;

/** Entrada da edicao de professor pela gestao (RN-04). Nao altera e-mail/CPF/RG. */
public record AtualizarProfessorInput(
        String nome,
        String telefone,
        String chavePix,
        String dadosBancarios,
        String idiomasHabilitados
) {
}
