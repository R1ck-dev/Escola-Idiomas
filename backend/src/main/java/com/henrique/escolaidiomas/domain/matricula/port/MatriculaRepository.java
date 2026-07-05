package com.henrique.escolaidiomas.domain.matricula.port;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.henrique.escolaidiomas.domain.matricula.enums.StatusMatricula;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;

public interface MatriculaRepository {
    Matricula salvar(Matricula matricula);
    Optional<Matricula> buscarPorId(UUID id);
    List<Matricula> listar();
    List<Matricula> listarPorStatus(StatusMatricula status);

    /**
     * Busca paginada para o painel da gestao (US-05). Filtra por {@code status} (opcional)
     * e, quando {@code alunoIds} nao e' nulo, restringe as matriculas desses alunos — o filtro
     * textual por nome/e-mail e' resolvido antes no contexto de identidade. {@code alunoIds}
     * nulo = sem filtro de aluno. Pagina na consulta, sem carregar tudo em memoria.
     */
    Page<Matricula> buscar(StatusMatricula status, Collection<UUID> alunoIds, Pageable pageable);

    /** Matriculas de uma turma num dado status (ex.: ATIVA — lista de chamada/US-17). */
    List<Matricula> listarPorTurmaEStatus(UUID turmaId, StatusMatricula status);

    /** Todas as matriculas de um aluno (area do aluno — US-20/21/22). */
    List<Matricula> listarPorAluno(UUID alunoId);

    /** Quantas matriculas ATIVAS a turma tem (para o limite de lotacao — RN-07). */
    long contarAtivasPorTurma(UUID turmaId);

    /** Ja existe matricula ativa ou aguardando para este aluno nesta turma? (evita duplicidade) */
    boolean existeAtivaOuPendente(UUID alunoId, UUID turmaId);
}
