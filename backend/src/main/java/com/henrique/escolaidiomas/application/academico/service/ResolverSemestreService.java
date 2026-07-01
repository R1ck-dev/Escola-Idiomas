package com.henrique.escolaidiomas.application.academico.service;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.domain.academico.model.Semestre;
import com.henrique.escolaidiomas.domain.academico.port.SemestreRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

import lombok.RequiredArgsConstructor;

/** Resolve o semestre alvo: por id explicito ou, na ausencia, o vigente na data. */
@Service
@RequiredArgsConstructor
public class ResolverSemestreService {

    private final SemestreRepository semestreRepository;

    /** Semestre por id (obrigatorio existir). */
    public Semestre porId(UUID semestreId) {
        return semestreRepository.buscarPorId(semestreId)
                .orElseThrow(() -> new NegocioException("Semestre nao encontrado."));
    }

    /** Semestre por id, ou o vigente na data quando id e' nulo. */
    public Semestre porIdOuVigente(UUID semestreId, LocalDate data) {
        if (semestreId != null) {
            return porId(semestreId);
        }
        return vigente(data);
    }

    /** Semestre cujo periodo contem a data. */
    public Semestre vigente(LocalDate data) {
        return semestreRepository.buscarVigente(data)
                .orElseThrow(() -> new NegocioException(
                        "Nenhum semestre vigente para a data " + data + ". Cadastre o semestre primeiro."));
    }
}
