package com.henrique.escolaidiomas.infrastructure.persistence.financeiro.repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.henrique.escolaidiomas.domain.financeiro.enums.StatusMensalidade;
import com.henrique.escolaidiomas.infrastructure.persistence.financeiro.entity.MensalidadeJpaEntity;

@Repository
public interface SpringDataMensalidadeRepository extends JpaRepository<MensalidadeJpaEntity, UUID> {
    List<MensalidadeJpaEntity> findByMatriculaId(UUID matriculaId);

    List<MensalidadeJpaEntity> findByCompetencia(String competencia);

    boolean existsByMatriculaIdAndCompetencia(UUID matriculaId, String competencia);

    List<MensalidadeJpaEntity> findByStatus(StatusMensalidade status);

    /** Painel paginado da competencia, sem filtro de situacao. */
    Page<MensalidadeJpaEntity> findByCompetencia(String competencia, Pageable pageable);

    /** Painel paginado da competencia por situacao PERSISTIDA (PAGA/CANCELADA). */
    Page<MensalidadeJpaEntity> findByCompetenciaAndStatus(String competencia, StatusMensalidade status, Pageable pageable);

    /**
     * Situacao DERIVADA "em dia" (ABERTA): nao esta paga/cancelada e ainda nao venceu
     * (vencimento &gt;= hoje). Espelha {@code Mensalidade.situacaoEm}.
     */
    @Query("""
            SELECT m FROM MensalidadeJpaEntity m
            WHERE m.competencia = :competencia
              AND m.status NOT IN :statusFinais
              AND m.vencimento >= :hoje
            """)
    Page<MensalidadeJpaEntity> buscarEmDia(@Param("competencia") String competencia,
            @Param("statusFinais") Collection<StatusMensalidade> statusFinais,
            @Param("hoje") LocalDate hoje, Pageable pageable);

    /**
     * Situacao DERIVADA "atrasada" (ATRASADA): nao esta paga/cancelada e ja venceu
     * (vencimento &lt; hoje). Espelha {@code Mensalidade.situacaoEm}.
     */
    @Query("""
            SELECT m FROM MensalidadeJpaEntity m
            WHERE m.competencia = :competencia
              AND m.status NOT IN :statusFinais
              AND m.vencimento < :hoje
            """)
    Page<MensalidadeJpaEntity> buscarAtrasadas(@Param("competencia") String competencia,
            @Param("statusFinais") Collection<StatusMensalidade> statusFinais,
            @Param("hoje") LocalDate hoje, Pageable pageable);
}
