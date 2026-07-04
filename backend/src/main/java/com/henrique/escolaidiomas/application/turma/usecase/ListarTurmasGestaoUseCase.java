package com.henrique.escolaidiomas.application.turma.usecase;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.turma.dto.TurmaGestaoDTO;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import lombok.RequiredArgsConstructor;

/**
 * Lista as turmas para a gestao com o nome do professor e a ocupacao atual (RN-06/07).
 * O nome do professor e' memoizado para nao rebuscar o mesmo professor a cada turma.
 */
@Service
@RequiredArgsConstructor
public class ListarTurmasGestaoUseCase {

    private final TurmaRepository turmaRepository;
    private final UsuarioRepository usuarioRepository;
    private final MatriculaRepository matriculaRepository;

    public List<TurmaGestaoDTO> execute() {
        Map<UUID, String> professorNomes = new HashMap<>();
        return turmaRepository.listar().stream()
                .map(t -> {
                    String professorNome = professorNomes.computeIfAbsent(t.getProfessorId(),
                            id -> usuarioRepository.buscarPorId(id).map(u -> u.getNome()).orElse(null));
                    long ocupacao = matriculaRepository.contarAtivasPorTurma(t.getId());
                    return TurmaGestaoDTO.de(t, professorNome, ocupacao);
                })
                .toList();
    }
}
