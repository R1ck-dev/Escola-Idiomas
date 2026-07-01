package com.henrique.escolaidiomas.application.matricula.dto;

import java.util.UUID;

/** Entrada da solicitacao de matricula (US-04). responsavel e' obrigatorio se menor. */
public record SolicitarMatriculaInput(
        UUID turmaId,
        DadosAlunoInput aluno,
        DadosResponsavelInput responsavel
) {
}
