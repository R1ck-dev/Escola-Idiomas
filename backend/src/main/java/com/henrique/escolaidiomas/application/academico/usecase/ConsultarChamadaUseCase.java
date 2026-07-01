package com.henrique.escolaidiomas.application.academico.usecase;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.academico.dto.ChamadaDTO;
import com.henrique.escolaidiomas.application.academico.service.ChamadaAssembler;
import com.henrique.escolaidiomas.application.academico.service.ResolverSemestreService;
import com.henrique.escolaidiomas.domain.academico.model.Aula;
import com.henrique.escolaidiomas.domain.academico.model.Semestre;
import com.henrique.escolaidiomas.domain.academico.port.AulaRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;
import com.henrique.escolaidiomas.domain.turma.model.Turma;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import lombok.RequiredArgsConstructor;

/**
 * US-17/18: lista a chamada de uma turma num dia. Se a aula ainda nao foi aberta,
 * devolve a lista de alunos ATIVOS com presenca nao marcada (null).
 */
@Service
@RequiredArgsConstructor
public class ConsultarChamadaUseCase {

    private final TurmaRepository turmaRepository;
    private final AulaRepository aulaRepository;
    private final ResolverSemestreService resolverSemestre;
    private final ChamadaAssembler chamadaAssembler;

    public ChamadaDTO execute(UUID professorId, UUID turmaId, LocalDate data) {
        Turma turma = turmaRepository.buscarPorId(turmaId)
                .orElseThrow(() -> new NegocioException("Turma nao encontrada."));
        if (!turma.getProfessorId().equals(professorId)) {
            throw new NegocioException("Esta turma nao pertence a este professor.");
        }

        LocalDate dia = (data != null) ? data : LocalDate.now();
        Semestre semestre = resolverSemestre.vigente(dia);

        UUID aulaId = aulaRepository.buscarPorTurmaSemestreEData(turmaId, semestre.getId(), dia)
                .map(Aula::getId).orElse(null);

        return new ChamadaDTO(aulaId, turmaId, semestre.getId(), dia,
                chamadaAssembler.montar(turmaId, aulaId));
    }
}
