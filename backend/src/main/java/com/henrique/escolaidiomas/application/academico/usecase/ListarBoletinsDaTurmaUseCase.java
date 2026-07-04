package com.henrique.escolaidiomas.application.academico.usecase;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.academico.dto.BoletimDTO;
import com.henrique.escolaidiomas.application.academico.service.ApurarBoletimService;
import com.henrique.escolaidiomas.application.academico.service.ResolverSemestreService;
import com.henrique.escolaidiomas.domain.academico.model.Semestre;
import com.henrique.escolaidiomas.domain.matricula.enums.StatusMatricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;
import com.henrique.escolaidiomas.domain.turma.model.Turma;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import lombok.RequiredArgsConstructor;

/**
 * US-24: apura em lote os boletins das matriculas ATIVAS de uma turma do professor autenticado.
 * Escopa/valida que a turma pertence ao professor (mesma regra do /me/turmas/{turmaId}/alunos) e
 * reusa {@link ApurarBoletimService} matricula a matricula. semestreId opcional (vigente).
 */
@Service
@RequiredArgsConstructor
public class ListarBoletinsDaTurmaUseCase {

    private final TurmaRepository turmaRepository;
    private final MatriculaRepository matriculaRepository;
    private final ResolverSemestreService resolverSemestre;
    private final ApurarBoletimService apurarBoletimService;

    public List<BoletimDTO> execute(UUID professorId, UUID turmaId, UUID semestreId) {
        Turma turma = turmaRepository.buscarPorId(turmaId)
                .orElseThrow(() -> new NegocioException("Turma nao encontrada."));
        if (!turma.getProfessorId().equals(professorId)) {
            throw new NegocioException("Esta turma nao pertence a este professor.");
        }
        Semestre semestre = resolverSemestre.porIdOuVigente(semestreId, LocalDate.now());
        return matriculaRepository.listarPorTurmaEStatus(turmaId, StatusMatricula.ATIVA).stream()
                .map(m -> apurarBoletimService.apurar(m, semestre))
                .toList();
    }
}
