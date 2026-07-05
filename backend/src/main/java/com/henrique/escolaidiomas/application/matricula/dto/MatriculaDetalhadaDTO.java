package com.henrique.escolaidiomas.application.matricula.dto;

import java.time.LocalDate;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.matricula.enums.StatusMatricula;

/**
 * Matricula enriquecida para os paineis da gestao: alem dos ids, traz os nomes do
 * aluno e da turma e, quando menor, os dados de contato do responsavel (nome, CPF,
 * telefone, e-mail) para a gestao expandir e ver direto na tela.
 */
public record MatriculaDetalhadaDTO(
        UUID id,
        UUID alunoId,
        String alunoNome,
        String alunoEmail,
        UUID turmaId,
        String turmaNome,
        LocalDate dataMatricula,
        StatusMatricula status,
        String motivoRejeicao,
        boolean menorIdade,
        String responsavelNome,
        String responsavelCpf,
        String responsavelTelefone,
        String responsavelEmail
) {
}
