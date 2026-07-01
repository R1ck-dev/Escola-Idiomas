package com.henrique.escolaidiomas.domain.financeiro.port;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.financeiro.model.Mensalidade;

public interface MensalidadeRepository {
    Mensalidade salvar(Mensalidade mensalidade);
    Optional<Mensalidade> buscarPorId(UUID id);
    List<Mensalidade> listarPorMatricula(UUID matriculaId);
    List<Mensalidade> listarPorCompetencia(String competencia);

    /** Mensalidades ainda ABERTA (nao pagas/canceladas) — candidatas a atraso (RN-29/41). */
    List<Mensalidade> listarEmAberto();

    /** Idempotencia da geracao mensal (RN-09): ja existe mensalidade desta matricula nesta competencia? */
    boolean existePorMatriculaECompetencia(UUID matriculaId, String competencia);
}
