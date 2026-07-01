package com.henrique.escolaidiomas.application.academico.usecase;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.academico.dto.AlunoNaTurmaDTO;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.domain.matricula.enums.StatusMatricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;
import com.henrique.escolaidiomas.domain.turma.model.Turma;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import lombok.RequiredArgsConstructor;

/** US-17: alunos (matriculas ATIVAS) de uma turma do professor autenticado. */
@Service
@RequiredArgsConstructor
public class ListarAlunosDaTurmaUseCase {

    private final TurmaRepository turmaRepository;
    private final MatriculaRepository matriculaRepository;
    private final UsuarioRepository usuarioRepository;

    public List<AlunoNaTurmaDTO> execute(UUID professorId, UUID turmaId) {
        Turma turma = turmaRepository.buscarPorId(turmaId)
                .orElseThrow(() -> new NegocioException("Turma nao encontrada."));
        if (!turma.getProfessorId().equals(professorId)) {
            throw new NegocioException("Esta turma nao pertence a este professor.");
        }
        return matriculaRepository.listarPorTurmaEStatus(turmaId, StatusMatricula.ATIVA).stream()
                .map(m -> new AlunoNaTurmaDTO(m.getId(), m.getAlunoId(),
                        usuarioRepository.buscarPorId(m.getAlunoId()).map(u -> u.getNome()).orElse("(aluno)")))
                .toList();
    }
}
