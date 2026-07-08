package com.henrique.escolaidiomas.application.academico.usecase;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.academico.dto.AulaFrequenciaDTO;
import com.henrique.escolaidiomas.application.academico.dto.FrequenciaTurmaDTO;
import com.henrique.escolaidiomas.application.academico.service.ResolverSemestreService;
import com.henrique.escolaidiomas.domain.academico.model.ApuracaoSemestre;
import com.henrique.escolaidiomas.domain.academico.model.Aula;
import com.henrique.escolaidiomas.domain.academico.model.Presenca;
import com.henrique.escolaidiomas.domain.academico.model.Semestre;
import com.henrique.escolaidiomas.domain.academico.port.AulaRepository;
import com.henrique.escolaidiomas.domain.academico.port.PresencaRepository;
import com.henrique.escolaidiomas.domain.matricula.enums.StatusMatricula;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;
import com.henrique.escolaidiomas.domain.turma.model.Turma;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import lombok.RequiredArgsConstructor;

/** US-21: frequencia aula-a-aula do aluno em cada turma ativa, no semestre alvo. */
@Service
@RequiredArgsConstructor
public class ConsultarFrequenciaDoAlunoUseCase {

    private final MatriculaRepository matriculaRepository;
    private final AulaRepository aulaRepository;
    private final PresencaRepository presencaRepository;
    private final TurmaRepository turmaRepository;
    private final ResolverSemestreService resolverSemestre;

    public List<FrequenciaTurmaDTO> execute(UUID alunoId, UUID semestreId) {
        Semestre semestre = resolverSemestre.porIdOuVigente(semestreId, LocalDate.now());
        return matriculaRepository.listarPorAluno(alunoId).stream()
                .filter(m -> m.getStatus() == StatusMatricula.ATIVA)
                .map(m -> montar(m, semestre))
                .toList();
    }

    private FrequenciaTurmaDTO montar(Matricula matricula, Semestre semestre) {
        // presente por aula (presente=false => falta; ausencia de registro => null)
        Map<UUID, Boolean> presentePorAula = presencaRepository
                .listarPorMatriculaESemestre(matricula.getId(), semestre.getId()).stream()
                .collect(Collectors.toMap(Presenca::getAulaId, Presenca::isPresente, (a, b) -> b));

        List<AulaFrequenciaDTO> aulas = aulaRepository
                .listarPorTurmaESemestre(matricula.getTurmaId(), semestre.getId()).stream()
                .sorted(Comparator.comparing(Aula::getData))
                .map(a -> new AulaFrequenciaDTO(a.getId(), a.getData(), presentePorAula.get(a.getId())))
                .toList();

        long faltas = presencaRepository
                .contarFaltasPorMatriculaESemestre(matricula.getId(), semestre.getId());
        long totalAulas = aulaRepository
                .contarPorTurmaESemestre(matricula.getTurmaId(), semestre.getId());
        // Reusa a apuracao do dominio para o percentual bater com o boletim (RN-33).
        ApuracaoSemestre apuracao = ApuracaoSemestre.apurar(null, null, faltas, totalAulas);

        String turmaNome = turmaRepository.buscarPorId(matricula.getTurmaId())
                .map(Turma::getNome).orElse(null);

        return new FrequenciaTurmaDTO(
                matricula.getId(),
                matricula.getTurmaId(),
                turmaNome,
                semestre.getId(),
                apuracao.getFaltas(),
                apuracao.getTotalAulas(),
                apuracao.getPercentualFaltas(),
                aulas);
    }
}
