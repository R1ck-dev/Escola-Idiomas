package com.henrique.escolaidiomas.application.turma.usecase;

import java.util.List;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.turma.dto.TurmaDTO;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import lombok.RequiredArgsConstructor;

/** Lista as turmas cadastradas. */
@Service
@RequiredArgsConstructor
public class ListarTurmasUseCase {

    private final TurmaRepository turmaRepository;

    public List<TurmaDTO> execute() {
        return turmaRepository.listar().stream().map(TurmaDTO::de).toList();
    }
}
