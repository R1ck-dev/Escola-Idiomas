package com.henrique.escolaidiomas.domain.identity.model;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.identity.enums.Role;
import com.henrique.escolaidiomas.domain.identity.enums.StatusUsuario;

/**
 * Professor (RN-04): cadastrado pela gestao. Guarda dados de contato e de
 * repasse (chave PIX / dados bancarios — RN-13). idiomasHabilitados e' descritivo;
 * o sistema NAO valida alocacao por idioma (RN-36).
 */
public class Professor extends Usuario {

    private String cpf;
    private String rg;
    private String telefone;
    private String chavePix;
    private String dadosBancarios;
    private String idiomasHabilitados;

    /** Construtor de criacao. */
    public Professor(UUID id, String nome, String email, String senhaHash,
            String cpf, String rg, String telefone, String chavePix,
            String dadosBancarios, String idiomasHabilitados) {
        super(id, nome, email, senhaHash, Role.PROFESSOR);
        this.cpf = cpf;
        this.rg = rg;
        this.telefone = telefone;
        this.chavePix = chavePix;
        this.dadosBancarios = dadosBancarios;
        this.idiomasHabilitados = idiomasHabilitados;
    }

    /** Construtor de reconstituicao. */
    public Professor(UUID id, String nome, String email, String senhaHash,
            StatusUsuario status, Role role, OffsetDateTime criadoEm,
            String cpf, String rg, String telefone, String chavePix,
            String dadosBancarios, String idiomasHabilitados) {
        super(id, nome, email, senhaHash, status, role, criadoEm);
        this.cpf = cpf;
        this.rg = rg;
        this.telefone = telefone;
        this.chavePix = chavePix;
        this.dadosBancarios = dadosBancarios;
        this.idiomasHabilitados = idiomasHabilitados;
    }

    public String getCpf() {
        return cpf;
    }

    public String getRg() {
        return rg;
    }

    public String getTelefone() {
        return telefone;
    }

    public String getChavePix() {
        return chavePix;
    }

    public String getDadosBancarios() {
        return dadosBancarios;
    }

    public String getIdiomasHabilitados() {
        return idiomasHabilitados;
    }
}
