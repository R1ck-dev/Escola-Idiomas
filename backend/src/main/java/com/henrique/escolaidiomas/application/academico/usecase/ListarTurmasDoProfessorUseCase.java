package com.henrique.escolaidiomas.application.academico.usecase;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.turma.dto.TurmaDoProfessorDTO;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import lombok.RequiredArgsConstructor;

/** US-17: turmas sob a responsabilidade do professor autenticado, com a ocupacao atual (RN-07). */
@Service
@RequiredArgsConstructor
public class ListarTurmasDoProfessorUseCase {

    private final TurmaRepository turmaRepository;
    private final MatriculaRepository matriculaRepository;

    public List<TurmaDoProfessorDTO> execute(UUID professorId) {
        return turmaRepository.listarPorProfessor(professorId).stream()
                .map(t -> TurmaDoProfessorDTO.de(t, matriculaRepository.contarAtivasPorTurma(t.getId())))
                .toList();
    }
}
