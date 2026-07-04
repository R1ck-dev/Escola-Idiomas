package com.henrique.escolaidiomas.application.turma.dto;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.turma.model.Turma;

/**
 * Turma sob a otica do professor autenticado (US-17): dados da turma + ocupacao atual
 * (matriculas ativas) para exibir "x/lotacao". DTO proprio para nao acoplar a leitura
 * do professor ao {@link TurmaDTO} compartilhado por outros consumidores.
 */
public record TurmaDoProfessorDTO(
        UUID id,
        UUID professorId,
        String nome,
        String idioma,
        String nivel,
        String diasSemana,
        LocalTime horaInicio,
        LocalTime horaFim,
        BigDecimal valorMensalidade,
        int lotacaoMaxima,
        long ocupacaoAtual,
        boolean ativa
) {
    public static TurmaDoProfessorDTO de(Turma t, long ocupacaoAtual) {
        return new TurmaDoProfessorDTO(
                t.getId(),
                t.getProfessorId(),
                t.getNome(),
                t.getIdioma(),
                t.getNivel(),
                t.getDiasSemana(),
                t.getHoraInicio(),
                t.getHoraFim(),
                t.getValorMensalidade(),
                t.getLotacaoMaxima(),
                ocupacaoAtual,
                t.isAtiva());
    }
}
