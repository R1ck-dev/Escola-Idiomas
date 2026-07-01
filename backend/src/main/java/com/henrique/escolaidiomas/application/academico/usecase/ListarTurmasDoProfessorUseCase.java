package com.henrique.escolaidiomas.application.academico.usecase;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.turma.dto.TurmaDTO;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import lombok.RequiredArgsConstructor;

/** US-17: turmas sob a responsabilidade do professor autenticado. */
@Service
@RequiredArgsConstructor
public class ListarTurmasDoProfessorUseCase {

    private final TurmaRepository turmaRepository;

    public List<TurmaDTO> execute(UUID professorId) {
        return turmaRepository.listarPorProfessor(professorId).stream().map(TurmaDTO::de).toList();
    }
}
