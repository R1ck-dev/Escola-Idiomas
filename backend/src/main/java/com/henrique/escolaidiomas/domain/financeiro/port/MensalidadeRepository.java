package com.henrique.escolaidiomas.domain.financeiro.port;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.henrique.escolaidiomas.domain.financeiro.enums.StatusMensalidade;
import com.henrique.escolaidiomas.domain.financeiro.model.Mensalidade;

public interface MensalidadeRepository {
    Mensalidade salvar(Mensalidade mensalidade);
    Optional<Mensalidade> buscarPorId(UUID id);
    List<Mensalidade> listarPorMatricula(UUID matriculaId);
    List<Mensalidade> listarPorCompetencia(String competencia);

    /**
     * Painel financeiro paginado do mes (RN-12). Filtra pela {@code competencia} e,
     * opcionalmente, pela {@code situacao}. PAGA/CANCELADA sao persistidas na coluna status;
     * ABERTA/ATRASADA sao DERIVADAS do vencimento vs {@code hoje} (nunca persistidas), por isso
     * o filtro e' traduzido para predicados sobre status + vencimento na propria consulta —
     * mantendo a contagem/paginacao coerente com a situacao exibida. {@code situacao} nulo =
     * todas as mensalidades da competencia.
     */
    Page<Mensalidade> buscarPainel(String competencia, StatusMensalidade situacao, LocalDate hoje, Pageable pageable);

    /** Mensalidades ainda ABERTA (nao pagas/canceladas) — candidatas a atraso (RN-29/41). */
    List<Mensalidade> listarEmAberto();

    /** Idempotencia da geracao mensal (RN-09): ja existe mensalidade desta matricula nesta competencia? */
    boolean existePorMatriculaECompetencia(UUID matriculaId, String competencia);
}
