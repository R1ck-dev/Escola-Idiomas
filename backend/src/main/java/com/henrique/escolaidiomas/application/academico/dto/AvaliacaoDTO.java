package com.henrique.escolaidiomas.application.academico.dto;

import java.util.UUID;

import com.henrique.escolaidiomas.domain.academico.enums.TipoAvaliacao;
import com.henrique.escolaidiomas.domain.academico.model.Avaliacao;

public record AvaliacaoDTO(
        UUID id,
        UUID matriculaId,
        UUID semestreId,
        TipoAvaliacao tipo,
        int nota
) {
    public static AvaliacaoDTO de(Avaliacao a) {
        return new AvaliacaoDTO(a.getId(), a.getMatriculaId(), a.getSemestreId(), a.getTipo(), a.getNota());
    }
}
