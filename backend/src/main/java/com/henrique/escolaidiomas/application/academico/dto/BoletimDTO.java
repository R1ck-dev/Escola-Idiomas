package com.henrique.escolaidiomas.application.academico.dto;

import java.math.BigDecimal;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.academico.enums.SituacaoAprovacao;

/** US-21/24: retrato academico da matricula no semestre (notas + frequencia + situacao). */
public record BoletimDTO(
        UUID matriculaId,
        UUID alunoId,
        String alunoNome,
        UUID turmaId,
        String turmaNome,
        UUID semestreId,
        String semestreReferencia,
        Integer notaMidterm,
        Integer notaFinal,
        BigDecimal media,
        long faltas,
        long totalAulas,
        BigDecimal percentualFaltas,
        SituacaoAprovacao situacao
) {
}
