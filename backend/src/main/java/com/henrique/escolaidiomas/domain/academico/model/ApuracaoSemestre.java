package com.henrique.escolaidiomas.domain.academico.model;

import java.math.BigDecimal;
import java.math.RoundingMode;

import com.henrique.escolaidiomas.domain.academico.enums.SituacaoAprovacao;

/**
 * Apuracao do semestre por matricula (RN-32/33/34), calculada na leitura:
 *  - media = (midterm + final) / 2  (RN-32);
 *  - % faltas = faltas / total de aulas do semestre  (RN-33);
 *  - APROVADO somente se media >= 70 E faltas <= 25%  (RN-34);
 *  - EM_ANDAMENTO enquanto faltar alguma das duas notas.
 */
public class ApuracaoSemestre {

    private static final BigDecimal MEDIA_MINIMA = new BigDecimal("70");
    private static final BigDecimal FALTAS_MAXIMA_PERCENT = new BigDecimal("25");

    private final Integer notaMidterm;
    private final Integer notaFinal;
    private final BigDecimal media;        // null enquanto incompleto
    private final long faltas;
    private final long totalAulas;
    private final BigDecimal percentualFaltas;
    private final SituacaoAprovacao situacao;

    private ApuracaoSemestre(Integer notaMidterm, Integer notaFinal, BigDecimal media, long faltas,
            long totalAulas, BigDecimal percentualFaltas, SituacaoAprovacao situacao) {
        this.notaMidterm = notaMidterm;
        this.notaFinal = notaFinal;
        this.media = media;
        this.faltas = faltas;
        this.totalAulas = totalAulas;
        this.percentualFaltas = percentualFaltas;
        this.situacao = situacao;
    }

    public static ApuracaoSemestre apurar(Integer notaMidterm, Integer notaFinal, long faltas, long totalAulas) {
        BigDecimal percentualFaltas = (totalAulas <= 0)
                ? BigDecimal.ZERO.setScale(2)
                : BigDecimal.valueOf(faltas).multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(totalAulas), 2, RoundingMode.HALF_UP);

        BigDecimal media = null;
        SituacaoAprovacao situacao = SituacaoAprovacao.EM_ANDAMENTO;
        if (notaMidterm != null && notaFinal != null) {
            media = BigDecimal.valueOf(notaMidterm + notaFinal)
                    .divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
            boolean mediaOk = media.compareTo(MEDIA_MINIMA) >= 0;
            boolean frequenciaOk = percentualFaltas.compareTo(FALTAS_MAXIMA_PERCENT) <= 0;
            situacao = (mediaOk && frequenciaOk) ? SituacaoAprovacao.APROVADO : SituacaoAprovacao.REPROVADO;
        }
        return new ApuracaoSemestre(notaMidterm, notaFinal, media, faltas, totalAulas, percentualFaltas, situacao);
    }

    public Integer getNotaMidterm() {
        return notaMidterm;
    }

    public Integer getNotaFinal() {
        return notaFinal;
    }

    public BigDecimal getMedia() {
        return media;
    }

    public long getFaltas() {
        return faltas;
    }

    public long getTotalAulas() {
        return totalAulas;
    }

    public BigDecimal getPercentualFaltas() {
        return percentualFaltas;
    }

    public SituacaoAprovacao getSituacao() {
        return situacao;
    }
}
