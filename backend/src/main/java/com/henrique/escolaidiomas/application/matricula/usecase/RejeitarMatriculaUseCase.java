package com.henrique.escolaidiomas.application.matricula.usecase;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.matricula.dto.MatriculaDTO;
import com.henrique.escolaidiomas.domain.identity.model.Aluno;
import com.henrique.escolaidiomas.domain.identity.model.Responsavel;
import com.henrique.escolaidiomas.domain.identity.port.EmailSenderPort;
import com.henrique.escolaidiomas.domain.identity.port.ResponsavelRepository;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/**
 * US-07 / RN-02: a gestao rejeita a solicitacao registrando o motivo (RN-21) e o
 * sistema avisa o solicitante por e-mail (RN-19). Para menor, avisa o responsavel.
 */
@Service
@RequiredArgsConstructor
public class RejeitarMatriculaUseCase {

    private final MatriculaRepository matriculaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ResponsavelRepository responsavelRepository;
    private final EmailSenderPort emailSenderPort;

    @Transactional
    public MatriculaDTO execute(UUID matriculaId, String motivo) {
        Matricula matricula = matriculaRepository.buscarPorId(matriculaId)
                .orElseThrow(() -> new NegocioException("Matricula nao encontrada."));

        matricula.rejeitar(motivo);
        matriculaRepository.salvar(matricula);

        notificarRejeicao(matricula, motivo);
        return MatriculaDTO.de(matricula);
    }

    private void notificarRejeicao(Matricula matricula, String motivo) {
        Aluno aluno = (Aluno) usuarioRepository.buscarPorId(matricula.getAlunoId())
                .orElseThrow(() -> new NegocioException("Aluno da matricula nao encontrado."));

        String destinatario = aluno.getEmail();
        String nome = aluno.getNome();

        if (aluno.isMenor() && aluno.getResponsavelId() != null) {
            Responsavel responsavel = responsavelRepository.buscarPorId(aluno.getResponsavelId()).orElse(null);
            if (responsavel != null && responsavel.getEmail() != null && !responsavel.getEmail().isBlank()) {
                destinatario = responsavel.getEmail();
                nome = responsavel.getNome();
            }
        }

        if (destinatario != null && !destinatario.isBlank()) {
            emailSenderPort.enviarEmailRejeicao(destinatario, nome, motivo);
        }
    }
}
