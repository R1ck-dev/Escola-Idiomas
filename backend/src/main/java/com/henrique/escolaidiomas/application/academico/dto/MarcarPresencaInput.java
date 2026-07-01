package com.henrique.escolaidiomas.application.academico.dto;

import java.util.UUID;

/** Item da chamada: marca presenca/falta de uma matricula. */
public record MarcarPresencaInput(
        UUID matriculaId,
        boolean presente
) {
}
