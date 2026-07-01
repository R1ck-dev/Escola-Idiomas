package com.henrique.escolaidiomas.application.academico.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.academico.dto.PresencaDTO;
import com.henrique.escolaidiomas.domain.academico.port.PresencaRepository;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.domain.matricula.enums.StatusMatricula;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;

import lombok.RequiredArgsConstructor;

/**
 * Monta a lista de chamada de uma turma: os alunos com matricula ATIVA e, se a aula
 * ja existe, a marcacao de cada um (presente = null quando ainda nao marcado).
 */
@Service
@RequiredArgsConstructor
public class ChamadaAssembler {

    private final MatriculaRepository matriculaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PresencaRepository presencaRepository;

    public List<PresencaDTO> montar(UUID turmaId, UUID aulaId) {
        List<Matricula> ativas = matriculaRepository.listarPorTurmaEStatus(turmaId, StatusMatricula.ATIVA);
        return ativas.stream().map(m -> {
            String nome = usuarioRepository.buscarPorId(m.getAlunoId())
                    .map(u -> u.getNome()).orElse("(aluno)");
            Boolean presente = (aulaId == null) ? null
                    : presencaRepository.buscarPorAulaEMatricula(aulaId, m.getId())
                            .map(p -> Boolean.valueOf(p.isPresente())).orElse(null);
            return new PresencaDTO(m.getId(), m.getAlunoId(), nome, presente);
        }).toList();
    }
}
