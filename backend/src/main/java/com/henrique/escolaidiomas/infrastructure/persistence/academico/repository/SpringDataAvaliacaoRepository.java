package com.henrique.escolaidiomas.infrastructure.persistence.academico.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.henrique.escolaidiomas.domain.academico.enums.TipoAvaliacao;
import com.henrique.escolaidiomas.infrastructure.persistence.academico.entity.AvaliacaoJpaEntity;

@Repository
public interface SpringDataAvaliacaoRepository extends JpaRepository<AvaliacaoJpaEntity, UUID> {
    Optional<AvaliacaoJpaEntity> findByMatriculaIdAndSemestreIdAndTipo(
            UUID matriculaId, UUID semestreId, TipoAvaliacao tipo);

    List<AvaliacaoJpaEntity> findByMatriculaIdAndSemestreId(UUID matriculaId, UUID semestreId);
}
