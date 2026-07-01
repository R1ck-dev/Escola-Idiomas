package com.henrique.escolaidiomas.application.academico.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** RN-35: abre a turma no dia (data) e marca a presenca de cada matricula. */
public record RegistrarChamadaInput(
        UUID turmaId,
        LocalDate data,
        List<MarcarPresencaInput> presencas
) {
}
