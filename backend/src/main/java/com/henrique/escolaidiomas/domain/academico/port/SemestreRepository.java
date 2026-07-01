package com.henrique.escolaidiomas.domain.academico.port;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.academico.model.Semestre;

public interface SemestreRepository {
    Semestre salvar(Semestre semestre);
    Optional<Semestre> buscarPorId(UUID id);
    Optional<Semestre> buscarPorReferencia(String referencia);
    List<Semestre> listar();

    /** Semestre cujo periodo contem a data (semestre vigente). */
    Optional<Semestre> buscarVigente(LocalDate data);
}
