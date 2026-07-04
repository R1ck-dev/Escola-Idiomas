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

/** US-14: a gestao estorna uma baixa (reverte o pagamento e limpa a data de pagamento). */
@Service
@RequiredArgsConstructor
public class EstornarBaixaMensalidadeUseCase {

    private final MensalidadeRepository mensalidadeRepository;

    @Transactional
    public MensalidadeDTO execute(UUID mensalidadeId) {
        Mensalidade mensalidade = mensalidadeRepository.buscarPorId(mensalidadeId)
                .orElseThrow(() -> new NegocioException("Mensalidade nao encontrada."));
        mensalidade.estornarBaixa();
        return MensalidadeDTO.de(mensalidadeRepository.salvar(mensalidade), LocalDate.now());
    }
}
