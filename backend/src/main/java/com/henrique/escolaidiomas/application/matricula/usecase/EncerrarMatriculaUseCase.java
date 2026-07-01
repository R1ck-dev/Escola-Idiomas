package com.henrique.escolaidiomas.application.matricula.usecase;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.matricula.dto.MatriculaDTO;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/**
 * US-23 / RN-27: a gestao encerra uma matricula. A partir do encerramento, a geracao
 * mensal (RN-09, fatia futura) deixa de gerar mensalidades para ela.
 */
@Service
@RequiredArgsConstructor
public class EncerrarMatriculaUseCase {

    private final MatriculaRepository matriculaRepository;

    @Transactional
    public MatriculaDTO execute(UUID matriculaId) {
        Matricula matricula = matriculaRepository.buscarPorId(matriculaId)
                .orElseThrow(() -> new NegocioException("Matricula nao encontrada."));
        matricula.encerrar();
        return MatriculaDTO.de(matriculaRepository.salvar(matricula));
    }
}
