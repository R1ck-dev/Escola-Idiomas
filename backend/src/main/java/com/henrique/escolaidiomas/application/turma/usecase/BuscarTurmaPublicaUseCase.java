package com.henrique.escolaidiomas.application.turma.usecase;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.turma.dto.TurmaPublicaDTO;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;
import com.henrique.escolaidiomas.domain.turma.model.Turma;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import lombok.RequiredArgsConstructor;

/** Busca a visao publica de uma turma (banner da matricula publica — sem dados sensiveis). */
@Service
@RequiredArgsConstructor
public class BuscarTurmaPublicaUseCase {

    private final TurmaRepository turmaRepository;
    private final MatriculaRepository matriculaRepository;

    public TurmaPublicaDTO execute(UUID id) {
        Turma turma = turmaRepository.buscarPorId(id)
                .orElseThrow(() -> new NegocioException("Turma nao encontrada."));
        // RN-07: sinaliza vagas esgotadas sem expor os numeros. Turma inativa tambem
        // nao aceita novas matriculas, entao conta como "cheia" para a UI publica.
        boolean cheia = !turma.isAtiva()
                || matriculaRepository.contarAtivasPorTurma(turma.getId()) >= turma.getLotacaoMaxima();
        return TurmaPublicaDTO.de(turma, cheia);
    }
}
