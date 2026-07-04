package com.henrique.escolaidiomas.application.matricula.usecase;

import java.util.List;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.matricula.dto.MatriculaDetalhadaDTO;
import com.henrique.escolaidiomas.domain.matricula.enums.StatusMatricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;

import lombok.RequiredArgsConstructor;

/**
 * US-05: a gestao lista as matriculas (opcionalmente filtrando por status), ja
 * enriquecidas com os nomes de aluno/turma/responsavel para exibir na tabela.
 */
@Service
@RequiredArgsConstructor
public class ListarMatriculasUseCase {

    private final MatriculaRepository matriculaRepository;
    private final MatriculaEnricher enricher;

    public List<MatriculaDetalhadaDTO> execute(StatusMatricula status) {
        var matriculas = (status == null)
                ? matriculaRepository.listar()
                : matriculaRepository.listarPorStatus(status);
        return enricher.enriquecer(matriculas);
    }
}
