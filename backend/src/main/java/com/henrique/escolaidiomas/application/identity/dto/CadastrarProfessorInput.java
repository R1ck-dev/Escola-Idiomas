package com.henrique.escolaidiomas.application.identity.dto;

/** Entrada do cadastro de professor pela gestao (RN-04). Sem senha: o professor
 *  define a propria no 1o acesso (RN-39). */
public record CadastrarProfessorInput(
        String nome,
        String email,
        String cpf,
        String rg,
        String telefone,
        String chavePix,
        String dadosBancarios,
        String idiomasHabilitados
) {
}
