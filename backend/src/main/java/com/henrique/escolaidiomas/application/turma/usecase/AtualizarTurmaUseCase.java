package com.henrique.escolaidiomas.application.turma.usecase;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.turma.dto.AtualizarTurmaInput;
import com.henrique.escolaidiomas.application.turma.dto.TurmaDTO;
import com.henrique.escolaidiomas.domain.identity.enums.Role;
import com.henrique.escolaidiomas.domain.identity.model.Usuario;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;
import com.henrique.escolaidiomas.domain.turma.model.Turma;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/** US-09: a gestao edita uma turma. Mudar o valor afeta apenas mensalidades futuras (RN-30). */
@Service
@RequiredArgsConstructor
public class AtualizarTurmaUseCase {

    private final TurmaRepository turmaRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public TurmaDTO execute(AtualizarTurmaInput input) {
        Turma turma = turmaRepository.buscarPorId(input.turmaId())
                .orElseThrow(() -> new NegocioException("Turma nao encontrada."));

        validarProfessor(input.professorId());

        turma.atualizar(
                input.professorId(),
                input.nome(),
                input.idioma(),
                input.nivel(),
                input.diasSemana(),
                input.horaInicio(),
                input.horaFim(),
                input.valorMensalidade(),
                input.lotacaoMaxima(),
                input.ativa());

        return TurmaDTO.de(turmaRepository.salvar(turma));
    }

    private void validarProfessor(UUID professorId) {
        if (professorId == null) {
            throw new NegocioException("A turma precisa de um professor responsavel.");
        }
        Usuario usuario = usuarioRepository.buscarPorId(professorId)
                .orElseThrow(() -> new NegocioException("Professor nao encontrado."));
        if (usuario.getRole() != Role.PROFESSOR) {
            throw new NegocioException("O usuario informado nao e' um professor.");
        }
    }
}
