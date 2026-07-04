package com.henrique.escolaidiomas.application.matricula.dto;

import java.time.LocalDate;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.matricula.enums.StatusMatricula;

/**
 * Matricula enriquecida para os paineis da gestao: alem dos ids, traz os nomes do
 * aluno e da turma (e do responsavel, quando menor) para exibir direto na tabela.
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
        String responsavelNome
) {
}
