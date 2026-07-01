package com.henrique.escolaidiomas.infrastructure.persistence.identity.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.henrique.escolaidiomas.infrastructure.persistence.identity.entity.ResponsavelJpaEntity;

@Repository
public interface SpringDataResponsavelRepository extends JpaRepository<ResponsavelJpaEntity, UUID> {
    Optional<ResponsavelJpaEntity> findByCpf(String cpf);
}
