package com.henrique.escolaidiomas.infrastructure.persistence.academico.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.henrique.escolaidiomas.infrastructure.persistence.academico.entity.AulaJpaEntity;

@Repository
public interface SpringDataAulaRepository extends JpaRepository<AulaJpaEntity, UUID> {
    Optional<AulaJpaEntity> findByTurmaIdAndSemestreIdAndData(UUID turmaId, UUID semestreId, LocalDate data);

    long countByTurmaIdAndSemestreId(UUID turmaId, UUID semestreId);

    List<AulaJpaEntity> findByTurmaIdAndSemestreIdOrderByDataAsc(UUID turmaId, UUID semestreId);
}
