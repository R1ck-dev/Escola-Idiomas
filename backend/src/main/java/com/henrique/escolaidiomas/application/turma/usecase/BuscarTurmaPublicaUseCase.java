package com.henrique.escolaidiomas.application.turma.usecase;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.turma.dto.TurmaPublicaDTO;
import com.henrique.escolaidiomas.domain.shared.NegocioException;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import lombok.RequiredArgsConstructor;

/** Busca a visao publica de uma turma (banner da matricula publica — sem dados sensiveis). */
@Service
@RequiredArgsConstructor
public class BuscarTurmaPublicaUseCase {

    private final TurmaRepository turmaRepository;

    public TurmaPublicaDTO execute(UUID id) {
        return turmaRepository.buscarPorId(id)
                .map(TurmaPublicaDTO::de)
                .orElseThrow(() -> new NegocioException("Turma nao encontrada."));
    }
}
