package com.henrique.escolaidiomas.application.financeiro.usecase;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.financeiro.config.BoletoProperties;
import com.henrique.escolaidiomas.application.financeiro.dto.BoletoCobrancaDTO;
import com.henrique.escolaidiomas.domain.financeiro.boleto.BoletoBancario;
import com.henrique.escolaidiomas.domain.financeiro.enums.StatusMensalidade;
import com.henrique.escolaidiomas.domain.financeiro.model.Mensalidade;
import com.henrique.escolaidiomas.domain.financeiro.port.MensalidadeRepository;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

import lombok.RequiredArgsConstructor;

/**
 * RN-25 (simulado): gera o boleto bancario (codigo de barras + linha digitavel) de uma mensalidade
 * em aberto. O valor cobrado ja inclui multa/mora se atrasada (RN-23/24). Sem API do banco: formato
 * FEBRABAN valido, sem registro real; a baixa e' manual ou simulada. Espelha {@link GerarCobrancaPixUseCase}.
 */
@Service
@RequiredArgsConstructor
public class GerarBoletoUseCase {

    private final MensalidadeRepository mensalidadeRepository;
    private final MatriculaRepository matriculaRepository;
    private final BoletoProperties boleto;

    /** Uso da gestao: gera o boleto de qualquer mensalidade. */
    public BoletoCobrancaDTO execute(UUID mensalidadeId) {
        Mensalidade mensalidade = carregar(mensalidadeId);
        garantirPagavel(mensalidade);
        return montar(mensalidade);
    }

    /** Uso do aluno: so gera o boleto de mensalidade de uma matricula sua. */
    public BoletoCobrancaDTO executeDoAluno(UUID mensalidadeId, UUID alunoId) {
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

    private BoletoCobrancaDTO montar(Mensalidade mensalidade) {
        var valor = mensalidade.valorAtualizadoEm(LocalDate.now());
        String nossoNumero = nossoNumero(mensalidade.getId());
        BoletoBancario.Boleto b = BoletoBancario.montar(
                boleto.banco(), boleto.carteira(), boleto.agencia(), boleto.conta(),
                nossoNumero, mensalidade.getVencimento(), valor);
        return new BoletoCobrancaDTO(
                mensalidade.getId(),
                mensalidade.getCompetencia(),
                mensalidade.getVencimento(),
                valor,
                boleto.beneficiario(),
                nossoNumero,
                b.linhaDigitavel(),
                b.codigoBarras());
    }

    /** Nosso numero deterministico (11 digitos) derivado do id da mensalidade. */
    private String nossoNumero(UUID mensalidadeId) {
        long n = mensalidadeId.getMostSignificantBits() & Long.MAX_VALUE;
        return String.format("%011d", n % 100_000_000_000L);
    }
}
