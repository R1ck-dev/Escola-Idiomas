package com.henrique.escolaidiomas.infrastructure.persistence.turma.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.henrique.escolaidiomas.infrastructure.persistence.turma.entity.TurmaJpaEntity;

@Repository
public interface SpringDataTurmaRepository extends JpaRepository<TurmaJpaEntity, UUID> {
    List<TurmaJpaEntity> findByProfessorId(UUID professorId);
}
