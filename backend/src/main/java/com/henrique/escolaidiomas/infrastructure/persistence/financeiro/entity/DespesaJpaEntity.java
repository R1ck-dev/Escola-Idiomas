package com.henrique.escolaidiomas.infrastructure.persistence.financeiro.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.financeiro.enums.CategoriaDespesa;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "despesas")
@Getter
@Setter
public class DespesaJpaEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoriaDespesa categoria;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false)
    private LocalDate data;

    @Column(name = "professor_id")
    private UUID professorId;
}
