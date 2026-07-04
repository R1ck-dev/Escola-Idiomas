package com.henrique.escolaidiomas.application.matricula.usecase;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.application.matricula.dto.MatriculaDetalhadaDTO;
import com.henrique.escolaidiomas.domain.identity.model.Aluno;
import com.henrique.escolaidiomas.domain.identity.model.Responsavel;
import com.henrique.escolaidiomas.domain.identity.model.Usuario;
import com.henrique.escolaidiomas.domain.identity.port.ResponsavelRepository;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;
import com.henrique.escolaidiomas.domain.turma.model.Turma;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import lombok.RequiredArgsConstructor;

/**
 * Monta {@link MatriculaDetalhadaDTO} cruzando a matricula com aluno, turma e
 * responsavel. Contextos desacoplados guardam so ids; aqui juntamos os nomes para
 * a UI. Numa lista, o nome da turma e' memoizado para evitar buscas repetidas.
 */
@Component
@RequiredArgsConstructor
public class MatriculaEnricher {

    private final UsuarioRepository usuarioRepository;
    private final TurmaRepository turmaRepository;
    private final ResponsavelRepository responsavelRepository;

    public MatriculaDetalhadaDTO enriquecer(Matricula matricula) {
        return montar(matricula, new HashMap<>());
    }

    public List<MatriculaDetalhadaDTO> enriquecer(List<Matricula> matriculas) {
        Map<UUID, String> turmaNomes = new HashMap<>();
        return matriculas.stream().map(m -> montar(m, turmaNomes)).toList();
    }

    private MatriculaDetalhadaDTO montar(Matricula m, Map<UUID, String> turmaNomes) {
        String alunoNome = null;
        String alunoEmail = null;
        String responsavelNome = null;
        boolean menor = false;

        Usuario usuario = usuarioRepository.buscarPorId(m.getAlunoId()).orElse(null);
        if (usuario instanceof Aluno aluno) {
            alunoNome = aluno.getNome();
            alunoEmail = aluno.getEmail();
            menor = aluno.isMenor();
            if (aluno.getResponsavelId() != null) {
                responsavelNome = responsavelRepository.buscarPorId(aluno.getResponsavelId())
                        .map(Responsavel::getNome)
                        .orElse(null);
            }
        } else if (usuario != null) {
            alunoNome = usuario.getNome();
            alunoEmail = usuario.getEmail();
        }

        String turmaNome = turmaNomes.computeIfAbsent(m.getTurmaId(),
                id -> turmaRepository.buscarPorId(id).map(Turma::getNome).orElse(null));

        return new MatriculaDetalhadaDTO(
                m.getId(),
                m.getAlunoId(),
                alunoNome,
                alunoEmail,
                m.getTurmaId(),
                turmaNome,
                m.getDataMatricula(),
                m.getStatus(),
                m.getMotivoRejeicao(),
                menor,
                responsavelNome);
    }
}
