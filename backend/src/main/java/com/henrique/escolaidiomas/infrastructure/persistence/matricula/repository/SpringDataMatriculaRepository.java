package com.henrique.escolaidiomas.infrastructure.persistence.matricula.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    /** Painel paginado por status (opcional). */
    @Query("SELECT m FROM MatriculaJpaEntity m WHERE (:status IS NULL OR m.status = :status)")
    Page<MatriculaJpaEntity> buscar(@Param("status") StatusMatricula status, Pageable pageable);

    /** Painel paginado por status (opcional) restrito aos alunos informados (filtro textual). */
    @Query("SELECT m FROM MatriculaJpaEntity m WHERE (:status IS NULL OR m.status = :status) AND m.alunoId IN :alunoIds")
    Page<MatriculaJpaEntity> buscarPorAlunoIds(@Param("status") StatusMatricula status,
            @Param("alunoIds") Collection<UUID> alunoIds, Pageable pageable);
}
