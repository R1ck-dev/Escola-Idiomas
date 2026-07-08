package com.henrique.escolaidiomas.application.academico.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Frequencia detalhada do aluno numa turma/semestre (US-21): o agregado (faltas, total,
 * percentual) mais a lista aula-a-aula. Complementa o {@link BoletimDTO}, casado por matriculaId.
 */
public record FrequenciaTurmaDTO(
        UUID matriculaId,
        UUID turmaId,
        String turmaNome,
        UUID semestreId,
        long faltas,
        long totalAulas,
        BigDecimal percentualFaltas,
        List<AulaFrequenciaDTO> aulas
) {
}
