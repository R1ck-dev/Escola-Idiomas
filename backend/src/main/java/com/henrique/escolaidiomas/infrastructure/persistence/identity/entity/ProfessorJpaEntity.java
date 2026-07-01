package com.henrique.escolaidiomas.infrastructure.persistence.identity.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Subtipo Professor (heranca JOINED). Guarda dados de contato e de repasse.
 * usuario_id e' a mesma PK do usuario base.
 */
@Entity
@Table(name = "professores")
@PrimaryKeyJoinColumn(name = "usuario_id")
@Getter
@Setter
public class ProfessorJpaEntity extends UsuarioJpaEntity {

    @Column(nullable = false, unique = true)
    private String cpf;

    private String rg;

    private String telefone;

    @Column(name = "chave_pix")
    private String chavePix;

    @Column(name = "dados_bancarios")
    private String dadosBancarios;

    @Column(name = "idiomas_habilitados")
    private String idiomasHabilitados;
}
