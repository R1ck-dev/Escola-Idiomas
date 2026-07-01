package com.henrique.escolaidiomas.application.financeiro.usecase;

import java.time.YearMonth;
import java.util.List;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.domain.financeiro.model.Mensalidade;
import com.henrique.escolaidiomas.domain.financeiro.port.MensalidadeRepository;
import com.henrique.escolaidiomas.domain.matricula.enums.StatusMatricula;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;
import com.henrique.escolaidiomas.domain.turma.model.Turma;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/**
 * RN-09/10/11/37: gera as mensalidades do mes para toda matricula ATIVA. Comeca no
 * mes seguinte ao da matricula (a 1a e' pro-rata) e e' idempotente — chamar duas
 * vezes no mesmo mes nao duplica. Acionado por cron externo (job protegido).
 */
@Service
@RequiredArgsConstructor
public class GerarMensalidadesMensaisUseCase {

    private final MatriculaRepository matriculaRepository;
    private final TurmaRepository turmaRepository;
    private final MensalidadeRepository mensalidadeRepository;

    @Transactional
    public int execute(int ano, int mes) {
        String competencia = String.format("%d-%02d", ano, mes);
        YearMonth alvo = YearMonth.of(ano, mes);

        List<Matricula> ativas = matriculaRepository.listarPorStatus(StatusMatricula.ATIVA);
        int geradas = 0;

        for (Matricula matricula : ativas) {
            // RN-37: nao gera para o mes da matricula (ja tem a 1a pro-rata) nem para meses anteriores.
            if (!YearMonth.from(matricula.getDataMatricula()).isBefore(alvo)) {
                continue;
            }
            // RN-09: idempotencia — nao duplica se ja existe nesta competencia.
            if (mensalidadeRepository.existePorMatriculaECompetencia(matricula.getId(), competencia)) {
                continue;
            }
            Turma turma = turmaRepository.buscarPorId(matricula.getTurmaId()).orElse(null);
            if (turma == null) {
                continue;
            }
            mensalidadeRepository.salvar(
                    Mensalidade.mensal(matricula.getId(), turma.getValorMensalidade(), ano, mes));
            geradas++;
        }
        return geradas;
    }
}
