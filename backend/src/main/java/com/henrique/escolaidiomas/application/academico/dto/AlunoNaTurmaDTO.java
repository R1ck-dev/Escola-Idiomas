package com.henrique.escolaidiomas.application.academico.dto;

import java.util.UUID;

/** US-17: aluno de uma turma sob a otica do professor (via matricula ativa). */
public record AlunoNaTurmaDTO(
        UUID matriculaId,
        UUID alunoId,
        String alunoNome
) {
}
