package com.henrique.escolaidiomas.domain.academico.model;

import java.util.UUID;

import com.henrique.escolaidiomas.domain.academico.enums.TipoAvaliacao;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

/**
 * Nota de uma matricula num semestre (RN-31): MIDTERM ou FINAL, escala 0 a 100.
 * Unica por (matricula, semestre, tipo) — relancar apenas corrige a nota.
 */
public class Avaliacao {

    private UUID id;
    private UUID matriculaId;
    private UUID semestreId;
    private TipoAvaliacao tipo;
    private int nota;

    /** Construtor de criacao. */
    public Avaliacao(UUID id, UUID matriculaId, UUID semestreId, TipoAvaliacao tipo, int nota) {
        if (matriculaId == null || semestreId == null || tipo == null) {
            throw new NegocioException("Avaliacao exige matricula, semestre e tipo.");
        }
        validarNota(nota);
        this.id = (id != null) ? id : UUID.randomUUID();
        this.matriculaId = matriculaId;
        this.semestreId = semestreId;
        this.tipo = tipo;
        this.nota = nota;
    }

    /** Relancamento da nota (correcao). */
    public void alterarNota(int nota) {
        validarNota(nota);
        this.nota = nota;
    }

    private void validarNota(int nota) {
        if (nota < 0 || nota > 100) {
            throw new NegocioException("A nota deve estar entre 0 e 100 (RN-31).");
        }
    }

    public UUID getId() {
        return id;
    }

    public UUID getMatriculaId() {
        return matriculaId;
    }

    public UUID getSemestreId() {
        return semestreId;
    }

    public TipoAvaliacao getTipo() {
        return tipo;
    }

    public int getNota() {
        return nota;
    }
}
