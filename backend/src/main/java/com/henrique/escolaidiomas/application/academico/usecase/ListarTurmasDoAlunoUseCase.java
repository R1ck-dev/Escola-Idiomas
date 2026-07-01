package com.henrique.escolaidiomas.application.academico.usecase;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.turma.dto.TurmaDTO;
import com.henrique.escolaidiomas.domain.matricula.enums.StatusMatricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import lombok.RequiredArgsConstructor;

/** US-20: turmas em que o aluno autenticado esta matriculado (ATIVA). */
@Service
@RequiredArgsConstructor
public class ListarTurmasDoAlunoUseCase {

    private final MatriculaRepository matriculaRepository;
    private final TurmaRepository turmaRepository;

    public List<TurmaDTO> execute(UUID alunoId) {
        return matriculaRepository.listarPorAluno(alunoId).stream()
                .filter(m -> m.getStatus() == StatusMatricula.ATIVA)
                .map(m -> turmaRepository.buscarPorId(m.getTurmaId()).orElse(null))
                .filter(t -> t != null)
                .map(TurmaDTO::de)
                .toList();
    }
}
