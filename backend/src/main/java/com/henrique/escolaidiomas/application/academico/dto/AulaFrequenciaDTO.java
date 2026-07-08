package com.henrique.escolaidiomas.application.academico.dto;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Uma ocorrencia de aula na visao do aluno (US-21): a data e se ele esteve presente.
 * {@code presente == null} = aula aberta sem registro de chamada para esta matricula.
 */
public record AulaFrequenciaDTO(
        UUID aulaId,
        LocalDate data,
        Boolean presente
) {
}
