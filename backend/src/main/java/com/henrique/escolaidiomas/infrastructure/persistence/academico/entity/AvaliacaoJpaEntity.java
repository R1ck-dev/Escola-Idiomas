package com.henrique.escolaidiomas.infrastructure.persistence.academico.entity;

import java.util.UUID;

import com.henrique.escolaidiomas.domain.academico.enums.TipoAvaliacao;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "avaliacoes")
@Getter
@Setter
public class AvaliacaoJpaEntity {

    @Id
    private UUID id;

    @Column(name = "matricula_id", nullable = false)
    private UUID matriculaId;

    @Column(name = "semestre_id", nullable = false)
    private UUID semestreId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoAvaliacao tipo;

    @Column(nullable = false)
    private int nota;
}
