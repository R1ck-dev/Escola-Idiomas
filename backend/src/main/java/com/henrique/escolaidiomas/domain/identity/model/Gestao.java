package com.henrique.escolaidiomas.domain.identity.model;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.identity.enums.Role;
import com.henrique.escolaidiomas.domain.identity.enums.StatusUsuario;

/**
 * Perfil de gestao (secretaria/administracao da escola). Nesta fatia e' o unico
 * subtipo concreto; Aluno e Professor entram nas fatias de cadastro/matricula.
 */
public class Gestao extends Usuario {

    /** Construtor de criacao. */
    public Gestao(UUID id, String nome, String email, String senhaHash) {
        super(id, nome, email, senhaHash, Role.GESTAO);
    }

    /** Construtor de reconstituicao. */
    public Gestao(UUID id, String nome, String email, String senhaHash,
            StatusUsuario status, Role role, OffsetDateTime criadoEm) {
        super(id, nome, email, senhaHash, status, role, criadoEm);
    }
}
