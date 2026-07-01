package com.henrique.escolaidiomas.domain.academico.port;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.academico.model.Presenca;

public interface PresencaRepository {
    Presenca salvar(Presenca presenca);
    Optional<Presenca> buscarPorAulaEMatricula(UUID aulaId, UUID matriculaId);
    List<Presenca> listarPorAula(UUID aulaId);

    /** Faltas da matricula no semestre (numerador do % de faltas — RN-33). */
    long contarFaltasPorMatriculaESemestre(UUID matriculaId, UUID semestreId);
}
