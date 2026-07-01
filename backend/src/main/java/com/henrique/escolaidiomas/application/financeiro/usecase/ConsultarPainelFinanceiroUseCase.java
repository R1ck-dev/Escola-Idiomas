package com.henrique.escolaidiomas.application.financeiro.usecase;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.financeiro.dto.MensalidadeDTO;
import com.henrique.escolaidiomas.domain.financeiro.port.MensalidadeRepository;

import lombok.RequiredArgsConstructor;

/**
 * RN-12: painel financeiro do mes. Lista as mensalidades da competencia com a
 * situacao (pago/aberto/atrasado) e o valor atualizado (multa/mora) calculados hoje.
 */
@Service
@RequiredArgsConstructor
public class ConsultarPainelFinanceiroUseCase {

    private final MensalidadeRepository mensalidadeRepository;

    public List<MensalidadeDTO> execute(String competencia) {
        LocalDate hoje = LocalDate.now();
        return mensalidadeRepository.listarPorCompetencia(competencia).stream()
                .map(m -> MensalidadeDTO.de(m, hoje))
                .toList();
    }
}
