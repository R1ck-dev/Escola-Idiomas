package com.henrique.escolaidiomas.domain.matricula.port;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.matricula.enums.StatusMatricula;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;

public interface MatriculaRepository {
    Matricula salvar(Matricula matricula);
    Optional<Matricula> buscarPorId(UUID id);
    List<Matricula> listar();
    List<Matricula> listarPorStatus(StatusMatricula status);

    /** Quantas matriculas ATIVAS a turma tem (para o limite de lotacao — RN-07). */
    long contarAtivasPorTurma(UUID turmaId);

    /** Ja existe matricula ativa ou aguardando para este aluno nesta turma? (evita duplicidade) */
    boolean existeAtivaOuPendente(UUID alunoId, UUID turmaId);
}
