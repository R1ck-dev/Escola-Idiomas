package com.henrique.escolaidiomas.application.financeiro.usecase;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.financeiro.service.NotificarCobrancaService;
import com.henrique.escolaidiomas.domain.financeiro.model.Mensalidade;
import com.henrique.escolaidiomas.domain.financeiro.port.MensalidadeRepository;
import com.henrique.escolaidiomas.domain.identity.enums.Role;
import com.henrique.escolaidiomas.domain.identity.model.Usuario;
import com.henrique.escolaidiomas.domain.identity.port.EmailSenderPort;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/**
 * RN-41/29: varre as mensalidades em aberto e, para as atrasadas:
 *  - envia UMA vez o aviso de atraso ao responsavel/aluno (flag avisoAtrasoEnviado);
 *  - monta um digest dos que atingiram 30 dias (teto da mora) e alerta a gestao.
 * Idempotente por rodada: acionado por cron externo (job protegido). O aviso ao
 * responsavel nao se repete; o digest a gestao e' um retrato dos >= 30 dias na rodada.
 */
@Service
@RequiredArgsConstructor
public class VerificarInadimplenciaUseCase {

    private static final int TETO_MORA_DIAS = 30;

    private final MensalidadeRepository mensalidadeRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmailSenderPort emailSenderPort;
    private final NotificarCobrancaService notificarCobrancaService;

    @Transactional
    public Resultado execute() {
        LocalDate hoje = LocalDate.now();
        int avisosAtraso = 0;
        List<String> linhasGestao = new ArrayList<>();

        for (Mensalidade m : mensalidadeRepository.listarEmAberto()) {
            long diasAtraso = m.diasAtrasoEm(hoje);
            if (diasAtraso == 0) {
                continue; // ainda dentro do prazo
            }
            // RN-41: aviso de atraso ao responsavel/aluno, uma unica vez.
            if (m.precisaAvisarAtraso(hoje)) {
                notificarCobrancaService.notificarAtraso(m, hoje);
                m.marcarAvisoAtrasoEnviado();
                mensalidadeRepository.salvar(m);
                avisosAtraso++;
            }
            // RN-29: atingiu o teto de 30 dias -> entra no digest da gestao.
            if (diasAtraso >= TETO_MORA_DIAS) {
                linhasGestao.add(String.format("%s - competencia %s - %d dias - R$ %s",
                        notificarCobrancaService.nomeDoAluno(m.getMatriculaId()),
                        m.getCompetencia(), diasAtraso, m.valorAtualizadoEm(hoje)));
            }
        }

        int gestoresNotificados = 0;
        if (!linhasGestao.isEmpty()) {
            for (Usuario gestor : usuarioRepository.listarPorRole(Role.GESTAO)) {
                if (gestor.getEmail() != null && !gestor.getEmail().isBlank()) {
                    emailSenderPort.enviarAlertaInadimplenciaGestao(gestor.getEmail(), linhasGestao);
                    gestoresNotificados++;
                }
            }
        }
        return new Resultado(avisosAtraso, linhasGestao.size(), gestoresNotificados);
    }

    /** Resumo da rodada para o retorno do job. */
    public record Resultado(int avisosAtrasoEnviados, int itensAtingiram30Dias, int gestoresNotificados) {
    }
}
