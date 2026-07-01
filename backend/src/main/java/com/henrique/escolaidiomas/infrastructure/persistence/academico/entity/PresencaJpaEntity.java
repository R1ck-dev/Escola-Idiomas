package com.henrique.escolaidiomas.infrastructure.persistence.academico.entity;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "presencas")
@Getter
@Setter
public class PresencaJpaEntity {

    @Id
    private UUID id;

    @Column(name = "aula_id", nullable = false)
    private UUID aulaId;

    @Column(name = "matricula_id", nullable = false)
    private UUID matriculaId;

    @Column(nullable = false)
    private boolean presente;
}
