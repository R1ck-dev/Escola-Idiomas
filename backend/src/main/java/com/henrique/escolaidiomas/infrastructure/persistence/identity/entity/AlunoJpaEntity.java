package com.henrique.escolaidiomas.infrastructure.persistence.identity.entity;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Subtipo Aluno (heranca JOINED). usuario_id e' a mesma PK do usuario base.
 * responsavel_id e' um UUID simples (FK no banco), nulo para maiores de idade.
 */
@Entity
@Table(name = "alunos")
@PrimaryKeyJoinColumn(name = "usuario_id")
@Getter
@Setter
public class AlunoJpaEntity extends UsuarioJpaEntity {

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @Column(nullable = false, unique = true)
    private String cpf;

    private String rg;

    private String telefone;

    private String endereco;

    private String observacoes;

    @Column(name = "responsavel_id")
    private UUID responsavelId;
}
