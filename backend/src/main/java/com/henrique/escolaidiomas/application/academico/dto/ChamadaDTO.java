package com.henrique.escolaidiomas.application.academico.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Chamada de uma turma num dia: aula (pode ainda nao existir) + lista de presencas. */
public record ChamadaDTO(
        UUID aulaId,
        UUID turmaId,
        UUID semestreId,
        LocalDate data,
        List<PresencaDTO> presencas
) {
}
