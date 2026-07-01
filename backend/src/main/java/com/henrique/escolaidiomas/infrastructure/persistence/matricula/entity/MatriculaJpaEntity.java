package com.henrique.escolaidiomas.infrastructure.persistence.matricula.entity;

import java.time.LocalDate;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.matricula.enums.StatusMatricula;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "matriculas")
@Getter
@Setter
public class MatriculaJpaEntity {

    @Id
    private UUID id;

    @Column(name = "aluno_id", nullable = false)
    private UUID alunoId;

    @Column(name = "turma_id", nullable = false)
    private UUID turmaId;

    @Column(name = "data_matricula", nullable = false)
    private LocalDate dataMatricula;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusMatricula status;

    @Column(name = "motivo_rejeicao")
    private String motivoRejeicao;
}
