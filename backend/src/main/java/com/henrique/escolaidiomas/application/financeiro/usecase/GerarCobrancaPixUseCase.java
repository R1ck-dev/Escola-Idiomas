package com.henrique.escolaidiomas.application.financeiro.usecase;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.financeiro.config.PixProperties;
import com.henrique.escolaidiomas.application.financeiro.dto.PixCobrancaDTO;
import com.henrique.escolaidiomas.domain.financeiro.enums.StatusMensalidade;
import com.henrique.escolaidiomas.domain.financeiro.model.Mensalidade;
import com.henrique.escolaidiomas.domain.financeiro.pix.PixBrCode;
import com.henrique.escolaidiomas.domain.financeiro.port.MensalidadeRepository;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

import lombok.RequiredArgsConstructor;

/**
 * RN-26: gera a cobranca PIX (BR Code com valor embutido) de uma mensalidade em aberto.
 * O valor cobrado ja inclui multa/mora se atrasada (RN-23/24). Sem PSP: apenas o copia-e-cola.
 */
@Service
@RequiredArgsConstructor
public class GerarCobrancaPixUseCase {

    private final MensalidadeRepository mensalidadeRepository;
    private final MatriculaRepository matriculaRepository;
    private final PixProperties pix;

    /** Uso da gestao: gera a cobranca de qualquer mensalidade. */
    public PixCobrancaDTO execute(UUID mensalidadeId) {
        Mensalidade mensalidade = carregar(mensalidadeId);
        garantirPagavel(mensalidade);
        return montar(mensalidade);
    }

    /** Uso do aluno: so gera a cobranca de mensalidade de uma matricula sua. */
    public PixCobrancaDTO executeDoAluno(UUID mensalidadeId, UUID alunoId) {
        Mensalidade mensalidade = carregar(mensalidadeId);
        // Posse ANTES de qualquer detalhe: mensalidade de outro aluno responde como inexistente.
        Matricula matricula = matriculaRepository.buscarPorId(mensalidade.getMatriculaId())
                .orElseThrow(() -> new NegocioException("Mensalidade nao encontrada."));
        if (!matricula.getAlunoId().equals(alunoId)) {
            throw new NegocioException("Mensalidade nao encontrada.");
        }
        garantirPagavel(mensalidade);
        return montar(mensalidade);
    }

    private Mensalidade carregar(UUID mensalidadeId) {
        return mensalidadeRepository.buscarPorId(mensalidadeId)
                .orElseThrow(() -> new NegocioException("Mensalidade nao encontrada."));
    }

    private void garantirPagavel(Mensalidade mensalidade) {
        if (mensalidade.getStatus() == StatusMensalidade.PAGA) {
            throw new NegocioException("Esta mensalidade ja esta paga.");
        }
        if (mensalidade.getStatus() == StatusMensalidade.CANCELADA) {
            throw new NegocioException("Esta mensalidade esta cancelada.");
        }
    }

    private PixCobrancaDTO montar(Mensalidade mensalidade) {
        var valor = mensalidade.valorAtualizadoEm(LocalDate.now());
        String copiaECola = PixBrCode.montar(pix.chave(), pix.recebedor(), pix.cidade(), valor);
        return new PixCobrancaDTO(
                mensalidade.getId(),
                mensalidade.getCompetencia(),
                mensalidade.getVencimento(),
                valor,
                pix.recebedor(),
                pix.chave(),
                copiaECola);
    }
}
