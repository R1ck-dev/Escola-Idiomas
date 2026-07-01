package com.henrique.escolaidiomas.application.turma.usecase;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.turma.dto.TurmaDTO;
import com.henrique.escolaidiomas.domain.shared.NegocioException;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import lombok.RequiredArgsConstructor;

/** Busca uma turma pelo id. */
@Service
@RequiredArgsConstructor
public class BuscarTurmaUseCase {

    private final TurmaRepository turmaRepository;

    public TurmaDTO execute(UUID id) {
        return turmaRepository.buscarPorId(id)
                .map(TurmaDTO::de)
                .orElseThrow(() -> new NegocioException("Turma nao encontrada."));
    }
}
