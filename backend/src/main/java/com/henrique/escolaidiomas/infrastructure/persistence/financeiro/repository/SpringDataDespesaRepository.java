package com.henrique.escolaidiomas.infrastructure.persistence.financeiro.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.henrique.escolaidiomas.infrastructure.persistence.financeiro.entity.DespesaJpaEntity;

@Repository
public interface SpringDataDespesaRepository extends JpaRepository<DespesaJpaEntity, UUID> {
    List<DespesaJpaEntity> findByDataBetweenOrderByDataAsc(LocalDate inicio, LocalDate fim);

    List<DespesaJpaEntity> findByProfessorIdOrderByDataDesc(UUID professorId);
}
