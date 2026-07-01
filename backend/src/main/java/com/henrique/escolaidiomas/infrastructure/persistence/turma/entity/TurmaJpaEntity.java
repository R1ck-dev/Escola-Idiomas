package com.henrique.escolaidiomas.infrastructure.persistence.turma.entity;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Turma. professor_id e' um UUID simples (ha' FK no banco, mas nao mapeamos
 * @ManyToOne para manter os contextos turma e identity desacoplados).
 */
@Entity
@Table(name = "turmas")
@Getter
@Setter
public class TurmaJpaEntity {

    @Id
    private UUID id;

    @Column(name = "professor_id", nullable = false)
    private UUID professorId;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String idioma;

    private String nivel;

    @Column(name = "dias_semana")
    private String diasSemana;

    @Column(name = "hora_inicio")
    private LocalTime horaInicio;

    @Column(name = "hora_fim")
    private LocalTime horaFim;

    @Column(name = "valor_mensalidade", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorMensalidade;

    @Column(name = "lotacao_maxima", nullable = false)
    private int lotacaoMaxima;

    @Column(nullable = false)
    private boolean ativa;
}
