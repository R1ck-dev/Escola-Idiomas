package com.henrique.escolaidiomas.infrastructure.persistence.academico.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.henrique.escolaidiomas.infrastructure.persistence.academico.entity.PresencaJpaEntity;

@Repository
public interface SpringDataPresencaRepository extends JpaRepository<PresencaJpaEntity, UUID> {
    Optional<PresencaJpaEntity> findByAulaIdAndMatriculaId(UUID aulaId, UUID matriculaId);

    List<PresencaJpaEntity> findByAulaId(UUID aulaId);

    /**
     * Faltas (presente=false) de uma matricula nas aulas de um semestre. Join implicito
     * entre presenca e aula pelo aula_id (contextos desacoplados, sem @ManyToOne).
     */
    @Query("""
            SELECT COUNT(p) FROM PresencaJpaEntity p, AulaJpaEntity a
            WHERE p.aulaId = a.id
              AND p.matriculaId = :matriculaId
              AND a.semestreId = :semestreId
              AND p.presente = false
            """)
    long contarFaltasPorMatriculaESemestre(@Param("matriculaId") UUID matriculaId,
            @Param("semestreId") UUID semestreId);

    /** Presencas da matricula nas aulas do semestre (join implicito por aula_id). */
    @Query("""
            SELECT p FROM PresencaJpaEntity p, AulaJpaEntity a
            WHERE p.aulaId = a.id
              AND p.matriculaId = :matriculaId
              AND a.semestreId = :semestreId
            """)
    List<PresencaJpaEntity> listarPorMatriculaESemestre(@Param("matriculaId") UUID matriculaId,
            @Param("semestreId") UUID semestreId);
}
