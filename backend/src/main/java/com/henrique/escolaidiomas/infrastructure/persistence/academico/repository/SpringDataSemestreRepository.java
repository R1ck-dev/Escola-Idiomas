package com.henrique.escolaidiomas.infrastructure.persistence.academico.repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.henrique.escolaidiomas.infrastructure.persistence.academico.entity.SemestreJpaEntity;

@Repository
public interface SpringDataSemestreRepository extends JpaRepository<SemestreJpaEntity, UUID> {
    Optional<SemestreJpaEntity> findByReferencia(String referencia);

    Optional<SemestreJpaEntity> findFirstByDataInicioLessThanEqualAndDataFimGreaterThanEqual(
            LocalDate inicio, LocalDate fim);
}
