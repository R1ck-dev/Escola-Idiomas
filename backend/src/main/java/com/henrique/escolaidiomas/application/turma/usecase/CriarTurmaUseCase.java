package com.henrique.escolaidiomas.application.turma.usecase;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.turma.dto.CriarTurmaInput;
import com.henrique.escolaidiomas.application.turma.dto.TurmaDTO;
import com.henrique.escolaidiomas.domain.identity.enums.Role;
import com.henrique.escolaidiomas.domain.identity.model.Usuario;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;
import com.henrique.escolaidiomas.domain.turma.model.Turma;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/** US-09: a gestao cria uma turma vinculada a um professor responsavel. */
@Service
@RequiredArgsConstructor
public class CriarTurmaUseCase {

    private final TurmaRepository turmaRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public TurmaDTO execute(CriarTurmaInput input) {
        validarProfessor(input.professorId());

        Turma turma = new Turma(
                null,
                input.professorId(),
                input.nome(),
                input.idioma(),
                input.nivel(),
                input.diasSemana(),
                input.horaInicio(),
                input.horaFim(),
                input.valorMensalidade(),
                input.lotacaoMaxima());

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
