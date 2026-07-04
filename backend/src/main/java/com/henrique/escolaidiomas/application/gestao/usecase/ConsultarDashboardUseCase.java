package com.henrique.escolaidiomas.application.gestao.usecase;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.gestao.dto.DashboardDTO;
import com.henrique.escolaidiomas.domain.financeiro.model.Mensalidade;
import com.henrique.escolaidiomas.domain.financeiro.port.MensalidadeRepository;
import com.henrique.escolaidiomas.domain.matricula.enums.StatusMatricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;

import lombok.RequiredArgsConstructor;

/**
 * Agrega o painel do mes: soma recebido (pagas), em aberto e em atraso (com multa/mora)
 * a partir das mensalidades da competencia, e conta as solicitacoes pendentes. A
 * competencia default e' o mes atual.
 */
@Service
@RequiredArgsConstructor
public class ConsultarDashboardUseCase {

    private final MensalidadeRepository mensalidadeRepository;
    private final MatriculaRepository matriculaRepository;

    public DashboardDTO execute(String competencia) {
        String comp = (competencia == null || competencia.isBlank())
                ? YearMonth.now().toString()
                : competencia;
        LocalDate hoje = LocalDate.now();

        BigDecimal recebido = BigDecimal.ZERO;
        BigDecimal emAberto = BigDecimal.ZERO;
        BigDecimal emAtraso = BigDecimal.ZERO;
        int pagas = 0;
        int inadimplentes = 0;

        var mensalidades = mensalidadeRepository.listarPorCompetencia(comp);
        for (Mensalidade m : mensalidades) {
            switch (m.situacaoEm(hoje)) {
                case PAGA -> {
                    recebido = recebido.add(m.getValorEfetivo());
                    pagas++;
                }
                case ABERTA -> emAberto = emAberto.add(m.getValorEfetivo());
                case ATRASADA -> {
                    emAtraso = emAtraso.add(m.valorAtualizadoEm(hoje));
                    inadimplentes++;
                }
                case CANCELADA -> {
                    // fora do caixa
                }
            }
        }

        int solicitacoesPendentes = matriculaRepository
                .listarPorStatus(StatusMatricula.AGUARDANDO_APROVACAO).size();

        return new DashboardDTO(comp, recebido, emAberto, emAtraso,
                inadimplentes, mensalidades.size(), pagas, solicitacoesPendentes);
    }
}
