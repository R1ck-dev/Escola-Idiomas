package com.henrique.escolaidiomas.application.academico.dto;

import java.util.UUID;

import com.henrique.escolaidiomas.domain.academico.enums.TipoAvaliacao;

/** semestreId opcional: quando nulo, usa o semestre vigente. */
public record LancarNotaInput(
        UUID matriculaId,
        UUID semestreId,
        TipoAvaliacao tipo,
        int nota
) {
}
