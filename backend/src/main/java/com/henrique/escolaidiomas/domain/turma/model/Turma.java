package com.henrique.escolaidiomas.domain.turma.model;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.shared.NegocioException;

/**
 * Turma de um idioma (RN-05). Referencia o professor responsavel por id (contextos
 * desacoplados). A lotacao maxima padrao e' 12 (RN-06). Alterar o valor afeta apenas
 * mensalidades futuras (RN-30) — as ja geradas guardam o valor da epoca.
 */
public class Turma {

    private static final int LOTACAO_PADRAO = 12;

    private UUID id;
    private UUID professorId;
    private String nome;
    private String idioma;
    private String nivel;
    private String diasSemana;
    private LocalTime horaInicio;
    private LocalTime horaFim;
    private BigDecimal valorMensalidade;
    private int lotacaoMaxima;
    private boolean ativa;

    /** Construtor de criacao. lotacaoMaxima nula/0 assume o padrao (12). */
    public Turma(UUID id, UUID professorId, String nome, String idioma, String nivel, String diasSemana,
            LocalTime horaInicio, LocalTime horaFim, BigDecimal valorMensalidade, Integer lotacaoMaxima) {
        this.id = (id != null) ? id : UUID.randomUUID();
        definir(professorId, nome, idioma, nivel, diasSemana, horaInicio, horaFim, valorMensalidade, lotacaoMaxima);
        this.ativa = true;
    }

    /** Construtor de reconstituicao. */
    public Turma(UUID id, UUID professorId, String nome, String idioma, String nivel, String diasSemana,
            LocalTime horaInicio, LocalTime horaFim, BigDecimal valorMensalidade, int lotacaoMaxima, boolean ativa) {
        this.id = id;
        this.professorId = professorId;
        this.nome = nome;
        this.idioma = idioma;
        this.nivel = nivel;
        this.diasSemana = diasSemana;
        this.horaInicio = horaInicio;
        this.horaFim = horaFim;
        this.valorMensalidade = valorMensalidade;
        this.lotacaoMaxima = lotacaoMaxima;
        this.ativa = ativa;
    }

    /** Atualiza os dados da turma (RN-30: o novo valor vale so para mensalidades futuras). */
    public void atualizar(UUID professorId, String nome, String idioma, String nivel, String diasSemana,
            LocalTime horaInicio, LocalTime horaFim, BigDecimal valorMensalidade, Integer lotacaoMaxima, boolean ativa) {
        definir(professorId, nome, idioma, nivel, diasSemana, horaInicio, horaFim, valorMensalidade, lotacaoMaxima);
        this.ativa = ativa;
    }

    private void definir(UUID professorId, String nome, String idioma, String nivel, String diasSemana,
            LocalTime horaInicio, LocalTime horaFim, BigDecimal valorMensalidade, Integer lotacaoMaxima) {
        if (professorId == null) {
            throw new NegocioException("A turma precisa de um professor responsavel.");
        }
        if (nome == null || nome.isBlank()) {
            throw new NegocioException("O nome da turma e' obrigatorio.");
        }
        if (idioma == null || idioma.isBlank()) {
            throw new NegocioException("O idioma da turma e' obrigatorio.");
        }
        if (valorMensalidade == null || valorMensalidade.signum() <= 0) {
            throw new NegocioException("O valor da mensalidade deve ser maior que zero.");
        }
        if (horaInicio != null && horaFim != null && !horaFim.isAfter(horaInicio)) {
            throw new NegocioException("O horario de termino deve ser depois do inicio.");
        }
        int lotacao = (lotacaoMaxima == null || lotacaoMaxima <= 0) ? LOTACAO_PADRAO : lotacaoMaxima;

        this.professorId = professorId;
        this.nome = nome;
        this.idioma = idioma;
        this.nivel = nivel;
        this.diasSemana = diasSemana;
        this.horaInicio = horaInicio;
        this.horaFim = horaFim;
        this.valorMensalidade = valorMensalidade;
        this.lotacaoMaxima = lotacao;
    }

    public UUID getId() {
        return id;
    }

    public UUID getProfessorId() {
        return professorId;
    }

    public String getNome() {
        return nome;
    }

    public String getIdioma() {
        return idioma;
    }

    public String getNivel() {
        return nivel;
    }

    public String getDiasSemana() {
        return diasSemana;
    }

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public LocalTime getHoraFim() {
        return horaFim;
    }

    public BigDecimal getValorMensalidade() {
        return valorMensalidade;
    }

    public int getLotacaoMaxima() {
        return lotacaoMaxima;
    }

    public boolean isAtiva() {
        return ativa;
    }
}
