package com.henrique.escolaidiomas.application.academico.usecase;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.turma.dto.TurmaDoAlunoDTO;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.domain.matricula.enums.StatusMatricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import lombok.RequiredArgsConstructor;

/**
 * US-20: turmas em que o aluno autenticado esta matriculado (ATIVA), com o nome do
 * professor responsavel. O nome e' memoizado para nao rebuscar o mesmo professor.
 */
@Service
@RequiredArgsConstructor
public class ListarTurmasDoAlunoUseCase {

    private final MatriculaRepository matriculaRepository;
    private final TurmaRepository turmaRepository;
    private final UsuarioRepository usuarioRepository;

    public List<TurmaDoAlunoDTO> execute(UUID alunoId) {
        Map<UUID, String> professorNomes = new HashMap<>();
        return matriculaRepository.listarPorAluno(alunoId).stream()
                .filter(m -> m.getStatus() == StatusMatricula.ATIVA)
                .map(m -> turmaRepository.buscarPorId(m.getTurmaId()).orElse(null))
                .filter(t -> t != null)
                .map(t -> {
                    String professorNome = professorNomes.computeIfAbsent(t.getProfessorId(),
                            id -> usuarioRepository.buscarPorId(id).map(u -> u.getNome()).orElse(null));
                    return TurmaDoAlunoDTO.de(t, professorNome);
                })
                .toList();
    }
}
