package com.henrique.escolaidiomas.application.financeiro.usecase;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.financeiro.dto.MensalidadeDTO;
import com.henrique.escolaidiomas.domain.financeiro.model.Mensalidade;
import com.henrique.escolaidiomas.domain.financeiro.port.MensalidadeRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/** US-14: a gestao da baixa manual num pagamento. */
@Service
@RequiredArgsConstructor
public class DarBaixaMensalidadeUseCase {

    private final MensalidadeRepository mensalidadeRepository;

    @Transactional
    public MensalidadeDTO execute(UUID mensalidadeId, LocalDate dataPagamento) {
        Mensalidade mensalidade = mensalidadeRepository.buscarPorId(mensalidadeId)
                .orElseThrow(() -> new NegocioException("Mensalidade nao encontrada."));
        mensalidade.pagar(dataPagamento);
        return MensalidadeDTO.de(mensalidadeRepository.salvar(mensalidade), LocalDate.now());
    }
}
