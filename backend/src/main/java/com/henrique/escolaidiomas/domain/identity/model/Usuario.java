package com.henrique.escolaidiomas.domain.identity.model;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.identity.enums.Role;
import com.henrique.escolaidiomas.domain.identity.enums.StatusUsuario;

/**
 * Raiz do agregado de identidade. Base abstrata (heranca JOINED) que concentra a
 * autenticacao comum; os subtipos {@code Gestao}/{@code Professor}/{@code Aluno}
 * compartilham o mesmo id e adicionam seus dados especificos.
 */
public abstract class Usuario {

    protected UUID id;
    protected String nome;
    protected String email;
    protected String senhaHash;   // null ate a ativacao por e-mail (RN-39)
    protected StatusUsuario status;
    protected Role role;
    protected OffsetDateTime criadoEm;

    /** Construtor de criacao: nasce PENDENTE_VERIFICACAO. */
    protected Usuario(UUID id, String nome, String email, String senhaHash, Role role) {
        this.id = (id != null) ? id : UUID.randomUUID();
        this.nome = nome;
        this.email = email;
        this.senhaHash = senhaHash;
        this.status = StatusUsuario.PENDENTE_VERIFICACAO;
        this.role = role;
        this.criadoEm = OffsetDateTime.now();
    }

    /** Construtor de reconstituicao (a partir da persistencia). */
    protected Usuario(UUID id, String nome, String email, String senhaHash,
            StatusUsuario status, Role role, OffsetDateTime criadoEm) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senhaHash = senhaHash;
        this.status = status;
        this.role = role;
        this.criadoEm = criadoEm;
    }

    /** Define/atualiza a senha (ja com hash). Usado no 1o acesso e na recuperacao. */
    public void definirSenha(String novaSenhaHash) {
        this.senhaHash = novaSenhaHash;
    }

    /** Marca a conta como ATIVA (apos verificacao de e-mail). */
    public void ativarConta() {
        this.status = StatusUsuario.ATIVO;
    }

    public UUID getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public String getSenhaHash() {
        return senhaHash;
    }

    public StatusUsuario getStatus() {
        return status;
    }

    public Role getRole() {
        return role;
    }

    public OffsetDateTime getCriadoEm() {
        return criadoEm;
    }
}
