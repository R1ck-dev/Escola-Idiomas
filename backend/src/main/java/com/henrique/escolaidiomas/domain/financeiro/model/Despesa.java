package com.henrique.escolaidiomas.domain.financeiro.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.financeiro.enums.CategoriaDespesa;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

/**
 * Saida do caixa (RN-12): luz, aluguel, repasse a professor etc. Quando a categoria
 * e' REPASSE_PROFESSOR, guarda o professor (RN-13) — os dados bancarios/PIX ficam no
 * cadastro do professor; aqui registra-se apenas o lancamento manual do repasse.
 */
public class Despesa {

    private UUID id;
    private String descricao;
    private CategoriaDespesa categoria;
    private BigDecimal valor;
    private LocalDate data;
    private UUID professorId; // preenchido so em REPASSE_PROFESSOR

    /** Construtor de criacao. */
    public Despesa(UUID id, String descricao, CategoriaDespesa categoria, BigDecimal valor,
            LocalDate data, UUID professorId) {
        this.id = (id != null) ? id : UUID.randomUUID();
        if (descricao == null || descricao.isBlank()) {
            throw new NegocioException("A descricao da despesa e' obrigatoria.");
        }
        if (categoria == null) {
            throw new NegocioException("A categoria da despesa e' obrigatoria.");
        }
        if (valor == null || valor.signum() <= 0) {
            throw new NegocioException("O valor da despesa deve ser maior que zero.");
        }
        if (categoria == CategoriaDespesa.REPASSE_PROFESSOR && professorId == null) {
            throw new NegocioException("Repasse a professor exige o professor de destino.");
        }
        this.descricao = descricao;
        this.categoria = categoria;
        this.valor = valor;
        this.data = (data != null) ? data : LocalDate.now();
        this.professorId = professorId;
    }

    public UUID getId() {
        return id;
    }

    public String getDescricao() {
        return descricao;
    }

    public CategoriaDespesa getCategoria() {
        return categoria;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public LocalDate getData() {
        return data;
    }

    public UUID getProfessorId() {
        return professorId;
    }
}
