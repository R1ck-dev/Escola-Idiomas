package com.henrique.escolaidiomas.application.academico.usecase;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.academico.dto.BoletimDTO;
import com.henrique.escolaidiomas.application.academico.service.ApurarBoletimService;
import com.henrique.escolaidiomas.application.academico.service.ResolverSemestreService;
import com.henrique.escolaidiomas.domain.academico.model.Semestre;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

import lombok.RequiredArgsConstructor;

/** US-24: apura o boletim de uma matricula (gestao/professor). semestreId opcional (vigente). */
@Service
@RequiredArgsConstructor
public class ApurarBoletimUseCase {

    private final MatriculaRepository matriculaRepository;
    private final ResolverSemestreService resolverSemestre;
    private final ApurarBoletimService apurarBoletimService;

    public BoletimDTO execute(UUID matriculaId, UUID semestreId) {
        Matricula matricula = matriculaRepository.buscarPorId(matriculaId)
                .orElseThrow(() -> new NegocioException("Matricula nao encontrada."));
        Semestre semestre = resolverSemestre.porIdOuVigente(semestreId, LocalDate.now());
        return apurarBoletimService.apurar(matricula, semestre);
    }
}
