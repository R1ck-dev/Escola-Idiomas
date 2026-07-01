package com.henrique.escolaidiomas.infrastructure.persistence.academico.entity;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "aulas")
@Getter
@Setter
public class AulaJpaEntity {

    @Id
    private UUID id;

    @Column(name = "turma_id", nullable = false)
    private UUID turmaId;

    @Column(name = "semestre_id", nullable = false)
    private UUID semestreId;

    @Column(nullable = false)
    private LocalDate data;
}
