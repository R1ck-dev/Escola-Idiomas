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
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/**
 * RN-20: a gestao coloca uma solicitacao na lista de espera (turma sem vaga) e o sistema
 * avisa o candidato por e-mail. Para menor, avisa o responsavel.
 */
@Service
@RequiredArgsConstructor
public class MoverParaListaEsperaUseCase {

    private final MatriculaRepository matriculaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ResponsavelRepository responsavelRepository;
    private final TurmaRepository turmaRepository;
    private final EmailSenderPort emailSenderPort;

    @Transactional
    public MatriculaDTO execute(UUID matriculaId) {
        Matricula matricula = matriculaRepository.buscarPorId(matriculaId)
                .orElseThrow(() -> new NegocioException("Matricula nao encontrada."));

        matricula.moverParaListaEspera();
        matriculaRepository.salvar(matricula);

        notificarCandidato(matricula);
        return MatriculaDTO.de(matricula);
    }

    private void notificarCandidato(Matricula matricula) {
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

        String turmaNome = turmaRepository.buscarPorId(matricula.getTurmaId())
                .map(t -> t.getNome()).orElse("turma pretendida");

        if (destinatario != null && !destinatario.isBlank()) {
            emailSenderPort.enviarEmailListaEspera(destinatario, nome, turmaNome);
        }
    }
}
