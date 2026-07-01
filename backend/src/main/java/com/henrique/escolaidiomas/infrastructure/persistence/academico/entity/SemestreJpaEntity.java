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
@Table(name = "semestres")
@Getter
@Setter
public class SemestreJpaEntity {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String referencia;

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_fim", nullable = false)
    private LocalDate dataFim;
}
