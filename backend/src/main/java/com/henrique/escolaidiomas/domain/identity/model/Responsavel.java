package com.henrique.escolaidiomas.domain.identity.model;

import java.util.UUID;

import com.henrique.escolaidiomas.domain.shared.NegocioException;

/**
 * Responsavel financeiro de um aluno menor (RN-18). Nao e' um usuario do sistema
 * (nao tem login) — apenas recebe os avisos de cobrança/rejeicao por e-mail.
 */
public class Responsavel {

    private UUID id;
    private String nome;
    private String cpf;
    private String telefone;
    private String email;

    public Responsavel(UUID id, String nome, String cpf, String telefone, String email) {
        if (nome == null || nome.isBlank()) {
            throw new NegocioException("O nome do responsavel e' obrigatorio.");
        }
        if (cpf == null || cpf.isBlank()) {
            throw new NegocioException("O CPF do responsavel e' obrigatorio.");
        }
        this.id = (id != null) ? id : UUID.randomUUID();
        this.nome = nome;
        this.cpf = cpf;
        this.telefone = telefone;
        this.email = email;
    }

    public UUID getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getCpf() {
        return cpf;
    }

    public String getTelefone() {
        return telefone;
    }

    public String getEmail() {
        return email;
    }
}
