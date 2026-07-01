package com.henrique.escolaidiomas.application.academico.dto;

import java.util.UUID;

/** Linha da chamada. presente = null quando ainda nao foi marcada para a aula. */
public record PresencaDTO(
        UUID matriculaId,
        UUID alunoId,
        String alunoNome,
        Boolean presente
) {
}
