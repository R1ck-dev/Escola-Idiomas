package com.henrique.escolaidiomas.domain.academico.port;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.academico.model.Aula;

public interface AulaRepository {
    Aula salvar(Aula aula);
    Optional<Aula> buscarPorId(UUID id);

    /** Aula ja aberta para a turma naquele dia/semestre (idempotencia da chamada). */
    Optional<Aula> buscarPorTurmaSemestreEData(UUID turmaId, UUID semestreId, LocalDate data);

    /** Total de aulas do semestre para a turma — denominador do % de faltas (RN-33). */
    long contarPorTurmaESemestre(UUID turmaId, UUID semestreId);

    List<Aula> listarPorTurmaESemestre(UUID turmaId, UUID semestreId);

    /** Todas as aulas ja abertas da turma (qualquer semestre), por data — navegacao da chamada. */
    List<Aula> listarPorTurma(UUID turmaId);
}
