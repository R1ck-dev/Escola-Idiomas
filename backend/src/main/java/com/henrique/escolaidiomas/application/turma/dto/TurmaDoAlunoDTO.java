package com.henrique.escolaidiomas.application.turma.dto;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.turma.model.Turma;

/**
 * Turma sob a otica do aluno autenticado (US-20): dados da turma + nome do professor
 * responsavel para exibir na tela do aluno. DTO proprio para nao acoplar a leitura do
 * aluno ao {@link TurmaDTO} compartilhado por outros consumidores.
 */
public record TurmaDoAlunoDTO(
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
        boolean ativa
) {
    public static TurmaDoAlunoDTO de(Turma t, String professorNome) {
        return new TurmaDoAlunoDTO(
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
                t.isAtiva());
    }
}
