package com.henrique.escolaidiomas.infrastructure.persistence.financeiro.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.henrique.escolaidiomas.domain.financeiro.enums.StatusMensalidade;
import com.henrique.escolaidiomas.infrastructure.persistence.financeiro.entity.MensalidadeJpaEntity;

@Repository
public interface SpringDataMensalidadeRepository extends JpaRepository<MensalidadeJpaEntity, UUID> {
    List<MensalidadeJpaEntity> findByMatriculaId(UUID matriculaId);

    List<MensalidadeJpaEntity> findByCompetencia(String competencia);

    boolean existsByMatriculaIdAndCompetencia(UUID matriculaId, String competencia);

    List<MensalidadeJpaEntity> findByStatus(StatusMensalidade status);
}
