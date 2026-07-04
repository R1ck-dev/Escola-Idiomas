package com.henrique.escolaidiomas.application.turma.dto;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.turma.model.Turma;

/**
 * Turma para o painel da gestao: dados da turma + nome do professor responsavel +
 * ocupacao atual (matriculas ativas) para exibir "x/lotacao" e sinalizar turma cheia.
 */
public record TurmaGestaoDTO(
        UUID id,
        UUID professorId,
        String professorNome,
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
    public static TurmaGestaoDTO de(Turma t, String professorNome, long ocupacaoAtual) {
        return new TurmaGestaoDTO(
                t.getId(),
                t.getProfessorId(),
                professorNome,
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
