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

import lombok.RequiredArgsConstructor;

/** US-21: boletim do aluno autenticado em cada turma ativa, no semestre alvo. */
@Service
@RequiredArgsConstructor
public class ConsultarBoletimDoAlunoUseCase {

    private final MatriculaRepository matriculaRepository;
    private final ResolverSemestreService resolverSemestre;
    private final ApurarBoletimService apurarBoletimService;

    public List<BoletimDTO> execute(UUID alunoId, UUID semestreId) {
        Semestre semestre = resolverSemestre.porIdOuVigente(semestreId, LocalDate.now());
        return matriculaRepository.listarPorAluno(alunoId).stream()
                .filter(m -> m.getStatus() == StatusMatricula.ATIVA)
                .map(m -> apurarBoletimService.apurar(m, semestre))
                .toList();
    }
}
