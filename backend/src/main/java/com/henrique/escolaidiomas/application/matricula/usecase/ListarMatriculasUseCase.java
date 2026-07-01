package com.henrique.escolaidiomas.application.matricula.usecase;

import java.util.List;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.matricula.dto.MatriculaDTO;
import com.henrique.escolaidiomas.domain.matricula.enums.StatusMatricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;

import lombok.RequiredArgsConstructor;

/** US-05: a gestao lista as matriculas (opcionalmente filtrando por status). */
@Service
@RequiredArgsConstructor
public class ListarMatriculasUseCase {

    private final MatriculaRepository matriculaRepository;

    public List<MatriculaDTO> execute(StatusMatricula status) {
        var matriculas = (status == null)
                ? matriculaRepository.listar()
                : matriculaRepository.listarPorStatus(status);
        return matriculas.stream().map(MatriculaDTO::de).toList();
    }
}
