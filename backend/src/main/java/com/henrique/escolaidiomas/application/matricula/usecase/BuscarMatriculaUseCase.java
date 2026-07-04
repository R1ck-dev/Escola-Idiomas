package com.henrique.escolaidiomas.application.matricula.usecase;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.matricula.dto.MatriculaDetalhadaDTO;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

import lombok.RequiredArgsConstructor;

/** Detalhe de uma matricula (gestao) com nomes de aluno/turma/responsavel resolvidos. */
@Service
@RequiredArgsConstructor
public class BuscarMatriculaUseCase {

    private final MatriculaRepository matriculaRepository;
    private final MatriculaEnricher enricher;

    public MatriculaDetalhadaDTO execute(UUID id) {
        var matricula = matriculaRepository.buscarPorId(id)
                .orElseThrow(() -> new NegocioException("Matricula nao encontrada."));
        return enricher.enriquecer(matricula);
    }
}
