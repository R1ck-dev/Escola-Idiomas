package com.henrique.escolaidiomas.infrastructure.persistence.identity.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.henrique.escolaidiomas.infrastructure.persistence.identity.entity.AlunoJpaEntity;

@Repository
public interface SpringDataAlunoRepository extends JpaRepository<AlunoJpaEntity, UUID> {
    Optional<AlunoJpaEntity> findByCpf(String cpf);

    /**
     * Alunos cujo nome ou e-mail contenham o termo (case-insensitive), ordenados por nome.
     * {@code termo} nulo retorna todos os alunos por nome; o limite vem via {@link Pageable}.
     */
    @Query("""
            SELECT a FROM AlunoJpaEntity a
            WHERE :termo IS NULL
               OR LOWER(a.nome) LIKE LOWER(CONCAT('%', :termo, '%'))
               OR LOWER(a.email) LIKE LOWER(CONCAT('%', :termo, '%'))
            ORDER BY a.nome ASC
            """)
    List<AlunoJpaEntity> buscarPorTermo(@Param("termo") String termo, Pageable pageable);

    /**
     * IDs dos alunos cujo nome ou e-mail contenham o termo (case-insensitive). O termo aqui
     * e' sempre nao nulo/nao vazio (garantido pelo caso de uso antes de aplicar o filtro).
     */
    @Query("""
            SELECT a.id FROM AlunoJpaEntity a
            WHERE LOWER(a.nome) LIKE LOWER(CONCAT('%', :termo, '%'))
               OR LOWER(a.email) LIKE LOWER(CONCAT('%', :termo, '%'))
            """)
    List<UUID> buscarIdsPorTermo(@Param("termo") String termo);
}
