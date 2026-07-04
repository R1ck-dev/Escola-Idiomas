package com.henrique.escolaidiomas.application.financeiro.usecase;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.domain.financeiro.port.DespesaRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/** US-16: a gestao exclui uma saida do caixa. */
@Service
@RequiredArgsConstructor
public class ExcluirDespesaUseCase {

    private final DespesaRepository despesaRepository;

    @Transactional
    public void execute(UUID id) {
        despesaRepository.buscarPorId(id)
                .orElseThrow(() -> new NegocioException("Despesa nao encontrada."));
        despesaRepository.excluir(id);
    }
}
