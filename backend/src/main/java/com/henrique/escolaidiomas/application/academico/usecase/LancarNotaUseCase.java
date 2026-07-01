package com.henrique.escolaidiomas.application.academico.usecase;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.academico.dto.AvaliacaoDTO;
import com.henrique.escolaidiomas.application.academico.dto.LancarNotaInput;
import com.henrique.escolaidiomas.application.academico.service.ResolverSemestreService;
import com.henrique.escolaidiomas.domain.academico.model.Avaliacao;
import com.henrique.escolaidiomas.domain.academico.model.Semestre;
import com.henrique.escolaidiomas.domain.academico.port.AvaliacaoRepository;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;
import com.henrique.escolaidiomas.domain.turma.model.Turma;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/**
 * US-19 / RN-31: o professor lanca a nota (MIDTERM/FINAL) de uma matricula no semestre.
 * Upsert por (matricula, semestre, tipo). So o professor da turma pode lancar.
 */
@Service
@RequiredArgsConstructor
public class LancarNotaUseCase {

    private final MatriculaRepository matriculaRepository;
    private final TurmaRepository turmaRepository;
    private final AvaliacaoRepository avaliacaoRepository;
    private final ResolverSemestreService resolverSemestre;

    @Transactional
    public AvaliacaoDTO execute(UUID professorId, LancarNotaInput input) {
        Matricula matricula = matriculaRepository.buscarPorId(input.matriculaId())
                .orElseThrow(() -> new NegocioException("Matricula nao encontrada."));
        Turma turma = turmaRepository.buscarPorId(matricula.getTurmaId())
                .orElseThrow(() -> new NegocioException("Turma da matricula nao encontrada."));
        if (!turma.getProfessorId().equals(professorId)) {
            throw new NegocioException("Esta turma nao pertence a este professor.");
        }

        Semestre semestre = resolverSemestre.porIdOuVigente(input.semestreId(), LocalDate.now());

        Avaliacao avaliacao = avaliacaoRepository
                .buscarPorMatriculaSemestreTipo(matricula.getId(), semestre.getId(), input.tipo())
                .orElse(null);
        if (avaliacao == null) {
            avaliacao = new Avaliacao(null, matricula.getId(), semestre.getId(), input.tipo(), input.nota());
        } else {
            avaliacao.alterarNota(input.nota());
        }
        return AvaliacaoDTO.de(avaliacaoRepository.salvar(avaliacao));
    }
}
