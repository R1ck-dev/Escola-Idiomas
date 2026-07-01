package com.henrique.escolaidiomas.domain.academico.model;

import java.time.LocalDate;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.shared.NegocioException;

/**
 * Semestre letivo global da escola (ex.: "2026-2"). Delimita o periodo de apuracao
 * de notas e frequencia (RN-31/33). Avaliacoes e aulas referenciam um semestre.
 */
public class Semestre {

    private UUID id;
    private String referencia;
    private LocalDate dataInicio;
    private LocalDate dataFim;

    /** Construtor de criacao. */
    public Semestre(UUID id, String referencia, LocalDate dataInicio, LocalDate dataFim) {
        this.id = (id != null) ? id : UUID.randomUUID();
        if (referencia == null || referencia.isBlank()) {
            throw new NegocioException("A referencia do semestre e' obrigatoria (ex.: 2026-2).");
        }
        if (dataInicio == null || dataFim == null) {
            throw new NegocioException("As datas de inicio e fim do semestre sao obrigatorias.");
        }
        if (!dataFim.isAfter(dataInicio)) {
            throw new NegocioException("A data de fim deve ser depois da data de inicio.");
        }
        this.referencia = referencia;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
    }

    /** Construtor de reconstituicao. */
    public Semestre(UUID id, String referencia, LocalDate dataInicio, LocalDate dataFim, boolean reconstituir) {
        this.id = id;
        this.referencia = referencia;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
    }

    /** A data cai dentro do periodo do semestre? (usado para achar o semestre vigente). */
    public boolean contem(LocalDate data) {
        return data != null && !data.isBefore(dataInicio) && !data.isAfter(dataFim);
    }

    public UUID getId() {
        return id;
    }

    public String getReferencia() {
        return referencia;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public LocalDate getDataFim() {
        return dataFim;
    }
}
