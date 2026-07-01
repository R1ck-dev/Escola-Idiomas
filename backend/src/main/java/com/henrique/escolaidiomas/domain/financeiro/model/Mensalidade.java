package com.henrique.escolaidiomas.domain.financeiro.model;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.financeiro.enums.StatusMensalidade;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

/**
 * Mensalidade de uma matricula (RN-11). Guarda o valor-base e o percentual; o valor
 * efetivo e' derivado (RN-30: mudar o valor da turma nao altera as ja geradas).
 * A primeira e' pro-rata pela semana do mes (RN-22/38) e vence no ato (RN-28).
 */
public class Mensalidade {

    private UUID id;
    private UUID matriculaId;
    private String competencia; // "yyyy-MM"
    private BigDecimal valorBase;
    private int percentual;     // 100 | 75 | 50 | 25 (pro-rata); 100 nas demais
    private LocalDate vencimento;
    private StatusMensalidade status;
    private LocalDate dataPagamento;
    private boolean prorata;

    /** Construtor de reconstituicao. */
    public Mensalidade(UUID id, UUID matriculaId, String competencia, BigDecimal valorBase, int percentual,
            LocalDate vencimento, StatusMensalidade status, LocalDate dataPagamento, boolean prorata) {
        this.id = id;
        this.matriculaId = matriculaId;
        this.competencia = competencia;
        this.valorBase = valorBase;
        this.percentual = percentual;
        this.vencimento = vencimento;
        this.status = status;
        this.dataPagamento = dataPagamento;
        this.prorata = prorata;
    }

    /**
     * Primeira mensalidade da matricula: pro-rata pela semana do mes (RN-22/38),
     * vence no ato da matricula (RN-28).
     */
    public static Mensalidade primeira(UUID matriculaId, BigDecimal valorBase, LocalDate dataMatricula) {
        int perc = percentualProRata(dataMatricula.getDayOfMonth());
        String competencia = String.format("%d-%02d", dataMatricula.getYear(), dataMatricula.getMonthValue());
        return new Mensalidade(UUID.randomUUID(), matriculaId, competencia, valorBase, perc,
                dataMatricula, StatusMensalidade.ABERTA, null, true);
    }

    /** RN-38: 1a semana = dias 1-7 (100%), 2a = 8-15 (75%), 3a = 16-23 (50%), 4a = 24+ (25%). */
    private static int percentualProRata(int diaDoMes) {
        if (diaDoMes <= 7) {
            return 100;
        }
        if (diaDoMes <= 15) {
            return 75;
        }
        if (diaDoMes <= 23) {
            return 50;
        }
        return 25;
    }

    /** Mensalidade recorrente (RN-09): 100% do valor, vencimento no dia 10 (RN-10). */
    public static Mensalidade mensal(UUID matriculaId, BigDecimal valorBase, int ano, int mes) {
        String competencia = String.format("%d-%02d", ano, mes);
        LocalDate vencimento = LocalDate.of(ano, mes, 10);
        return new Mensalidade(UUID.randomUUID(), matriculaId, competencia, valorBase, 100,
                vencimento, StatusMensalidade.ABERTA, null, false);
    }

    /** Baixa manual do pagamento (US-14). */
    public void pagar(LocalDate data) {
        if (this.status == StatusMensalidade.PAGA) {
            throw new NegocioException("Esta mensalidade ja esta paga.");
        }
        if (this.status == StatusMensalidade.CANCELADA) {
            throw new NegocioException("Nao e' possivel dar baixa numa mensalidade cancelada.");
        }
        this.status = StatusMensalidade.PAGA;
        this.dataPagamento = (data != null) ? data : LocalDate.now();
    }

    /** Situacao para exibicao: PAGA/CANCELADA (armazenado) ou ATRASADA/ABERTA (derivado). */
    public StatusMensalidade situacaoEm(LocalDate hoje) {
        if (this.status == StatusMensalidade.PAGA || this.status == StatusMensalidade.CANCELADA) {
            return this.status;
        }
        return hoje.isAfter(this.vencimento) ? StatusMensalidade.ATRASADA : StatusMensalidade.ABERTA;
    }

    /** Dias de atraso com teto de 30 dias (RN-29); 0 se em dia, paga ou cancelada. */
    public long diasAtrasoEm(LocalDate hoje) {
        if (this.status == StatusMensalidade.PAGA || this.status == StatusMensalidade.CANCELADA
                || !hoje.isAfter(this.vencimento)) {
            return 0;
        }
        return Math.min(ChronoUnit.DAYS.between(this.vencimento, hoje), 30);
    }

    /** Valor com multa (2%) + mora (R$1,00/dia, teto 30 dias) se atrasada (RN-23/24/29). */
    public BigDecimal valorAtualizadoEm(LocalDate hoje) {
        BigDecimal base = getValorEfetivo();
        long diasAtraso = diasAtrasoEm(hoje);
        if (diasAtraso == 0) {
            return base;
        }
        BigDecimal multa = base.multiply(new BigDecimal("0.02"));
        BigDecimal mora = BigDecimal.valueOf(diasAtraso); // R$1,00 por dia
        return base.add(multa).add(mora).setScale(2, RoundingMode.HALF_UP);
    }

    /** Valor efetivo = valorBase * percentual / 100 (derivado). */
    public BigDecimal getValorEfetivo() {
        return valorBase.multiply(BigDecimal.valueOf(percentual))
                .divide(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }

    public UUID getId() {
        return id;
    }

    public UUID getMatriculaId() {
        return matriculaId;
    }

    public String getCompetencia() {
        return competencia;
    }

    public BigDecimal getValorBase() {
        return valorBase;
    }

    public int getPercentual() {
        return percentual;
    }

    public LocalDate getVencimento() {
        return vencimento;
    }

    public StatusMensalidade getStatus() {
        return status;
    }

    public LocalDate getDataPagamento() {
        return dataPagamento;
    }

    public boolean isProrata() {
        return prorata;
    }
}
