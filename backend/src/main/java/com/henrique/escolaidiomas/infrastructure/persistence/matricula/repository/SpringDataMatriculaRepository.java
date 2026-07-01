package com.henrique.escolaidiomas.infrastructure.persistence.matricula.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.henrique.escolaidiomas.domain.matricula.enums.StatusMatricula;
import com.henrique.escolaidiomas.infrastructure.persistence.matricula.entity.MatriculaJpaEntity;

@Repository
public interface SpringDataMatriculaRepository extends JpaRepository<MatriculaJpaEntity, UUID> {

    long countByTurmaIdAndStatus(UUID turmaId, StatusMatricula status);

    boolean existsByAlunoIdAndTurmaIdAndStatusIn(UUID alunoId, UUID turmaId, Collection<StatusMatricula> status);

    List<MatriculaJpaEntity> findByStatus(StatusMatricula status);

    List<MatriculaJpaEntity> findByTurmaIdAndStatus(UUID turmaId, StatusMatricula status);

    List<MatriculaJpaEntity> findByAlunoId(UUID alunoId);
}
