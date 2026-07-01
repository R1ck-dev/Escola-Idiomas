package com.henrique.escolaidiomas.application.financeiro.usecase;

import java.time.YearMonth;
import java.util.List;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.financeiro.dto.DespesaDTO;
import com.henrique.escolaidiomas.domain.financeiro.port.DespesaRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

import lombok.RequiredArgsConstructor;

/** RN-12: extrato de despesas de uma competencia (ex.: ?competencia=2026-07). */
@Service
@RequiredArgsConstructor
public class ListarDespesasUseCase {

    private final DespesaRepository despesaRepository;

    public List<DespesaDTO> execute(String competencia) {
        YearMonth mes = parse(competencia);
        return despesaRepository.listarPorPeriodo(mes.atDay(1), mes.atEndOfMonth()).stream()
                .map(DespesaDTO::de)
                .toList();
    }

    private YearMonth parse(String competencia) {
        try {
            return YearMonth.parse(competencia);
        } catch (RuntimeException e) {
            throw new NegocioException("Competencia invalida. Use o formato yyyy-MM (ex.: 2026-07).");
        }
    }
}
