package com.henrique.escolaidiomas.infrastructure.persistence.financeiro.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.financeiro.enums.StatusMensalidade;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "mensalidades")
@Getter
@Setter
public class MensalidadeJpaEntity {

    @Id
    private UUID id;

    @Column(name = "matricula_id", nullable = false)
    private UUID matriculaId;

    @Column(nullable = false)
    private String competencia;

    @Column(name = "valor_base", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorBase;

    @Column(nullable = false)
    private int percentual;

    @Column(nullable = false)
    private LocalDate vencimento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusMensalidade status;

    @Column(name = "data_pagamento")
    private LocalDate dataPagamento;

    @Column(name = "is_prorata", nullable = false)
    private boolean prorata;

    @Column(name = "aviso_atraso_enviado", nullable = false)
    private boolean avisoAtrasoEnviado;
}
