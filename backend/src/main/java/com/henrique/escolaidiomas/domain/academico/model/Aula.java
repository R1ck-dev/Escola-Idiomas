package com.henrique.escolaidiomas.domain.academico.model;

import java.time.LocalDate;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.shared.NegocioException;

/**
 * Ocorrencia de aula de uma turma num dia (RN-35). Criada quando o professor abre a
 * turma para a chamada. O total de aulas do semestre e' o denominador do % de faltas.
 */
public class Aula {

    private UUID id;
    private UUID turmaId;
    private UUID semestreId;
    private LocalDate data;

    /** Construtor de criacao. */
    public Aula(UUID id, UUID turmaId, UUID semestreId, LocalDate data) {
        if (turmaId == null || semestreId == null || data == null) {
            throw new NegocioException("Aula exige turma, semestre e data.");
        }
        this.id = (id != null) ? id : UUID.randomUUID();
        this.turmaId = turmaId;
        this.semestreId = semestreId;
        this.data = data;
    }

    public UUID getId() {
        return id;
    }

    public UUID getTurmaId() {
        return turmaId;
    }

    public UUID getSemestreId() {
        return semestreId;
    }

    public LocalDate getData() {
        return data;
    }
}
