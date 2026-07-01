package com.henrique.escolaidiomas.domain.academico.model;

import java.util.UUID;

import com.henrique.escolaidiomas.domain.shared.NegocioException;

/**
 * Registro de presenca/falta de uma matricula numa ocorrencia de aula (RN-35).
 * Unico por (aula, matricula) — refazer a chamada apenas atualiza o valor.
 */
public class Presenca {

    private UUID id;
    private UUID aulaId;
    private UUID matriculaId;
    private boolean presente;

    /** Construtor de criacao. */
    public Presenca(UUID id, UUID aulaId, UUID matriculaId, boolean presente) {
        if (aulaId == null || matriculaId == null) {
            throw new NegocioException("Presenca exige aula e matricula.");
        }
        this.id = (id != null) ? id : UUID.randomUUID();
        this.aulaId = aulaId;
        this.matriculaId = matriculaId;
        this.presente = presente;
    }

    /** Atualiza a marcacao (refazer a chamada). */
    public void marcar(boolean presente) {
        this.presente = presente;
    }

    public UUID getId() {
        return id;
    }

    public UUID getAulaId() {
        return aulaId;
    }

    public UUID getMatriculaId() {
        return matriculaId;
    }

    public boolean isPresente() {
        return presente;
    }
}
