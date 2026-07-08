package com.henrique.escolaidiomas.application.matricula.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.domain.identity.enums.Role;
import com.henrique.escolaidiomas.domain.identity.model.Usuario;
import com.henrique.escolaidiomas.domain.identity.port.EmailSenderPort;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.domain.matricula.enums.StatusMatricula;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;
import com.henrique.escolaidiomas.domain.turma.model.Turma;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import lombok.RequiredArgsConstructor;

/**
 * RN-20: quando abre vaga numa turma (matricula trancada/encerrada ou lotacao aumentada)
 * e ha candidatos na lista de espera, alerta a gestao para contato e alocacao manual.
 */
@Service
@RequiredArgsConstructor
public class NotificarVagaAbertaService {

    private final TurmaRepository turmaRepository;
    private final MatriculaRepository matriculaRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmailSenderPort emailSenderPort;

    public void notificarSeAbriuVaga(UUID turmaId) {
        Turma turma = turmaRepository.buscarPorId(turmaId).orElse(null);
        if (turma == null) {
            return;
        }
        long vagas = turma.getLotacaoMaxima() - matriculaRepository.contarAtivasPorTurma(turmaId);
        if (vagas <= 0) {
            return;
        }
        List<Matricula> espera = matriculaRepository
                .listarPorTurmaEStatus(turmaId, StatusMatricula.LISTA_ESPERA);
        if (espera.isEmpty()) {
            return;
        }
        for (Usuario gestor : usuarioRepository.listarPorRole(Role.GESTAO)) {
            emailSenderPort.enviarAlertaVagaAberta(gestor.getEmail(), turma.getNome(), espera.size(), vagas);
        }
    }
}
