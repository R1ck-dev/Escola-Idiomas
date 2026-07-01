package com.henrique.escolaidiomas.application.academico.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.academico.dto.BoletimDTO;
import com.henrique.escolaidiomas.domain.academico.enums.TipoAvaliacao;
import com.henrique.escolaidiomas.domain.academico.model.ApuracaoSemestre;
import com.henrique.escolaidiomas.domain.academico.model.Avaliacao;
import com.henrique.escolaidiomas.domain.academico.model.Semestre;
import com.henrique.escolaidiomas.domain.academico.port.AulaRepository;
import com.henrique.escolaidiomas.domain.academico.port.AvaliacaoRepository;
import com.henrique.escolaidiomas.domain.academico.port.PresencaRepository;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;
import com.henrique.escolaidiomas.domain.turma.model.Turma;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import lombok.RequiredArgsConstructor;

/**
 * Monta o boletim de uma matricula num semestre (RN-32/33/34): junta notas, faltas e
 * total de aulas e delega o calculo/situacao ao dominio ({@link ApuracaoSemestre}).
 */
@Service
@RequiredArgsConstructor
public class ApurarBoletimService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final PresencaRepository presencaRepository;
    private final AulaRepository aulaRepository;
    private final TurmaRepository turmaRepository;
    private final UsuarioRepository usuarioRepository;

    public BoletimDTO apurar(Matricula matricula, Semestre semestre) {
        Integer midterm = null;
        Integer notaFinal = null;
        List<Avaliacao> notas = avaliacaoRepository
                .listarPorMatriculaESemestre(matricula.getId(), semestre.getId());
        for (Avaliacao a : notas) {
            if (a.getTipo() == TipoAvaliacao.MIDTERM) {
                midterm = a.getNota();
            } else if (a.getTipo() == TipoAvaliacao.FINAL) {
                notaFinal = a.getNota();
            }
        }

        long faltas = presencaRepository
                .contarFaltasPorMatriculaESemestre(matricula.getId(), semestre.getId());
        long totalAulas = aulaRepository
                .contarPorTurmaESemestre(matricula.getTurmaId(), semestre.getId());

        ApuracaoSemestre apuracao = ApuracaoSemestre.apurar(midterm, notaFinal, faltas, totalAulas);

        String turmaNome = turmaRepository.buscarPorId(matricula.getTurmaId())
                .map(Turma::getNome).orElse(null);
        String alunoNome = usuarioRepository.buscarPorId(matricula.getAlunoId())
                .map(u -> u.getNome()).orElse(null);

        return new BoletimDTO(
                matricula.getId(),
                matricula.getAlunoId(),
                alunoNome,
                matricula.getTurmaId(),
                turmaNome,
                semestre.getId(),
                semestre.getReferencia(),
                apuracao.getNotaMidterm(),
                apuracao.getNotaFinal(),
                apuracao.getMedia(),
                apuracao.getFaltas(),
                apuracao.getTotalAulas(),
                apuracao.getPercentualFaltas(),
                apuracao.getSituacao());
    }
}
