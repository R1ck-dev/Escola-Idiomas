package com.henrique.escolaidiomas.infrastructure.persistence.identity.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.henrique.escolaidiomas.domain.identity.enums.Role;
import com.henrique.escolaidiomas.infrastructure.persistence.identity.entity.UsuarioJpaEntity;

@Repository
public interface SpringDataUsuarioRepository extends JpaRepository<UsuarioJpaEntity, UUID> {
    Optional<UsuarioJpaEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    List<UsuarioJpaEntity> findByRole(Role role);
}
