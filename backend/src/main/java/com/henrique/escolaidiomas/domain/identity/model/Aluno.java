package com.henrique.escolaidiomas.domain.identity.model;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Period;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.identity.enums.Role;
import com.henrique.escolaidiomas.domain.identity.enums.StatusUsuario;

/**
 * Aluno. Criado a partir da solicitacao de matricula. Menor de idade tem login
 * proprio (RN-17), mas exige um responsavel financeiro (RN-18). O 1o acesso e'
 * provisionado por e-mail ao aprovar a matricula (RN-39).
 */
public class Aluno extends Usuario {

    private LocalDate dataNascimento;
    private String cpf;
    private String rg;
    private String telefone;
    private String endereco;
    private String observacoes;
    private UUID responsavelId;

    /** Construtor de criacao. */
    public Aluno(UUID id, String nome, String email, String senhaHash, LocalDate dataNascimento,
            String cpf, String rg, String telefone, String endereco, String observacoes, UUID responsavelId) {
        super(id, nome, email, senhaHash, Role.ALUNO);
        this.dataNascimento = dataNascimento;
        this.cpf = cpf;
        this.rg = rg;
        this.telefone = telefone;
        this.endereco = endereco;
        this.observacoes = observacoes;
        this.responsavelId = responsavelId;
    }

    /** Construtor de reconstituicao. */
    public Aluno(UUID id, String nome, String email, String senhaHash, StatusUsuario status, Role role,
            OffsetDateTime criadoEm, LocalDate dataNascimento, String cpf, String rg, String telefone,
            String endereco, String observacoes, UUID responsavelId) {
        super(id, nome, email, senhaHash, status, role, criadoEm);
        this.dataNascimento = dataNascimento;
        this.cpf = cpf;
        this.rg = rg;
        this.telefone = telefone;
        this.endereco = endereco;
        this.observacoes = observacoes;
        this.responsavelId = responsavelId;
    }

    /** Derivado da data de nascimento (RN-18). */
    public boolean isMenor() {
        return dataNascimento != null && Period.between(dataNascimento, LocalDate.now()).getYears() < 18;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
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

    public String getEndereco() {
        return endereco;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public UUID getResponsavelId() {
        return responsavelId;
    }
}
