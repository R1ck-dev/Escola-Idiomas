package com.henrique.escolaidiomas.application.academico.usecase;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.academico.dto.ChamadaDTO;
import com.henrique.escolaidiomas.application.academico.dto.MarcarPresencaInput;
import com.henrique.escolaidiomas.application.academico.dto.RegistrarChamadaInput;
import com.henrique.escolaidiomas.application.academico.service.ChamadaAssembler;
import com.henrique.escolaidiomas.application.academico.service.ResolverSemestreService;
import com.henrique.escolaidiomas.domain.academico.model.Aula;
import com.henrique.escolaidiomas.domain.academico.model.Presenca;
import com.henrique.escolaidiomas.domain.academico.model.Semestre;
import com.henrique.escolaidiomas.domain.academico.port.AulaRepository;
import com.henrique.escolaidiomas.domain.academico.port.PresencaRepository;
import com.henrique.escolaidiomas.domain.matricula.enums.StatusMatricula;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;
import com.henrique.escolaidiomas.domain.turma.model.Turma;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/**
 * US-18 / RN-35: o professor abre a turma no dia e marca presenca/falta. Cria a aula
 * uma unica vez por turma+semestre+data (idempotente) e faz upsert de cada presenca.
 * So o professor responsavel pela turma pode registrar.
 */
@Service
@RequiredArgsConstructor
public class RegistrarChamadaUseCase {

    private final TurmaRepository turmaRepository;
    private final MatriculaRepository matriculaRepository;
    private final AulaRepository aulaRepository;
    private final PresencaRepository presencaRepository;
    private final ResolverSemestreService resolverSemestre;
    private final ChamadaAssembler chamadaAssembler;

    @Transactional
    public ChamadaDTO execute(UUID professorId, RegistrarChamadaInput input) {
        Turma turma = turmaRepository.buscarPorId(input.turmaId())
                .orElseThrow(() -> new NegocioException("Turma nao encontrada."));
        if (!turma.getProfessorId().equals(professorId)) {
            throw new NegocioException("Esta turma nao pertence a este professor.");
        }

        LocalDate data = (input.data() != null) ? input.data() : LocalDate.now();
        Semestre semestre = resolverSemestre.vigente(data);

        Aula aula = aulaRepository.buscarPorTurmaSemestreEData(turma.getId(), semestre.getId(), data)
                .orElseGet(() -> aulaRepository.salvar(
                        new Aula(null, turma.getId(), semestre.getId(), data)));

        if (input.presencas() != null) {
            for (MarcarPresencaInput item : input.presencas()) {
                validarMatriculaNaTurma(item.matriculaId(), turma.getId());
                Presenca presenca = presencaRepository
                        .buscarPorAulaEMatricula(aula.getId(), item.matriculaId())
                        .orElseGet(() -> new Presenca(null, aula.getId(), item.matriculaId(), item.presente()));
                presenca.marcar(item.presente());
                presencaRepository.salvar(presenca);
            }
        }

        return new ChamadaDTO(aula.getId(), turma.getId(), semestre.getId(), data,
                chamadaAssembler.montar(turma.getId(), aula.getId()));
    }

    private void validarMatriculaNaTurma(UUID matriculaId, UUID turmaId) {
        Matricula matricula = matriculaRepository.buscarPorId(matriculaId)
                .orElseThrow(() -> new NegocioException("Matricula " + matriculaId + " nao encontrada."));
        if (!matricula.getTurmaId().equals(turmaId)) {
            throw new NegocioException("A matricula " + matriculaId + " nao e' desta turma.");
        }
        if (matricula.getStatus() != StatusMatricula.ATIVA) {
            throw new NegocioException("A matricula " + matriculaId + " nao esta ativa.");
        }
    }
}
