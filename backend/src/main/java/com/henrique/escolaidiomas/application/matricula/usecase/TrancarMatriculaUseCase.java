package com.henrique.escolaidiomas.application.matricula.usecase;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.matricula.dto.MatriculaDTO;
import com.henrique.escolaidiomas.application.matricula.service.NotificarVagaAbertaService;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/** US-23 / RN-27: a gestao tranca uma matricula ativa (abre vaga — RN-20). */
@Service
@RequiredArgsConstructor
public class TrancarMatriculaUseCase {

    private final MatriculaRepository matriculaRepository;
    private final NotificarVagaAbertaService notificarVagaAberta;

    @Transactional
    public MatriculaDTO execute(UUID matriculaId) {
        Matricula matricula = matriculaRepository.buscarPorId(matriculaId)
                .orElseThrow(() -> new NegocioException("Matricula nao encontrada."));
        matricula.trancar();
        MatriculaDTO dto = MatriculaDTO.de(matriculaRepository.salvar(matricula));
        notificarVagaAberta.notificarSeAbriuVaga(matricula.getTurmaId());
        return dto;
    }
}
