package com.henrique.escolaidiomas.application.financeiro.usecase;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.financeiro.dto.MensalidadeDTO;
import com.henrique.escolaidiomas.domain.financeiro.enums.StatusMensalidade;
import com.henrique.escolaidiomas.domain.financeiro.model.Mensalidade;
import com.henrique.escolaidiomas.domain.financeiro.port.MensalidadeRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/**
 * RN-26: confirmacao (simulada) do pagamento PIX — mimetiza o webhook de um PSP. Marca a
 * mensalidade como paga. Idempotente: se ja estiver paga, apenas retorna o estado atual.
 */
@Service
@RequiredArgsConstructor
public class ConfirmarPagamentoPixUseCase {

    private final MensalidadeRepository mensalidadeRepository;

    @Transactional
    public MensalidadeDTO execute(UUID mensalidadeId) {
        Mensalidade mensalidade = mensalidadeRepository.buscarPorId(mensalidadeId)
                .orElseThrow(() -> new NegocioException("Mensalidade nao encontrada."));
        if (mensalidade.getStatus() == StatusMensalidade.PAGA) {
            return MensalidadeDTO.de(mensalidade, LocalDate.now()); // idempotente
        }
        mensalidade.pagar(LocalDate.now());
        return MensalidadeDTO.de(mensalidadeRepository.salvar(mensalidade), LocalDate.now());
    }
}
