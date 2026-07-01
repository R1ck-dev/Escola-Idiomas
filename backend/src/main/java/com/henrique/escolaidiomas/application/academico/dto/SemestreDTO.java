package com.henrique.escolaidiomas.application.academico.dto;

import java.time.LocalDate;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.academico.model.Semestre;

public record SemestreDTO(
        UUID id,
        String referencia,
        LocalDate dataInicio,
        LocalDate dataFim
) {
    public static SemestreDTO de(Semestre s) {
        return new SemestreDTO(s.getId(), s.getReferencia(), s.getDataInicio(), s.getDataFim());
    }
}
