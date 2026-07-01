package com.henrique.escolaidiomas.application.academico.usecase;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.academico.dto.CriarSemestreInput;
import com.henrique.escolaidiomas.application.academico.dto.SemestreDTO;
import com.henrique.escolaidiomas.domain.academico.model.Semestre;
import com.henrique.escolaidiomas.domain.academico.port.SemestreRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/** A gestao abre um semestre letivo (base da apuracao de notas/frequencia — RN-31). */
@Service
@RequiredArgsConstructor
public class CriarSemestreUseCase {

    private final SemestreRepository semestreRepository;

    @Transactional
    public SemestreDTO execute(CriarSemestreInput input) {
        if (input.referencia() != null && semestreRepository.buscarPorReferencia(input.referencia()).isPresent()) {
            throw new NegocioException("Ja existe um semestre com a referencia " + input.referencia() + ".");
        }
        Semestre semestre = new Semestre(null, input.referencia(), input.dataInicio(), input.dataFim());
        return SemestreDTO.de(semestreRepository.salvar(semestre));
    }
}
