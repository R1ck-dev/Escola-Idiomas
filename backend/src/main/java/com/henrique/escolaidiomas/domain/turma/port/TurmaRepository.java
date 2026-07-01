package com.henrique.escolaidiomas.domain.turma.port;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.turma.model.Turma;

/** Porta de persistencia de turmas. */
public interface TurmaRepository {
    Turma salvar(Turma turma);
    Optional<Turma> buscarPorId(UUID id);
    List<Turma> listar();
}
