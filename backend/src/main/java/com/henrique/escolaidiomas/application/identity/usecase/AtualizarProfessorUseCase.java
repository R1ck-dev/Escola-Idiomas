package com.henrique.escolaidiomas.application.identity.usecase;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.identity.dto.AtualizarProfessorInput;
import com.henrique.escolaidiomas.application.identity.dto.ProfessorDTO;
import com.henrique.escolaidiomas.domain.identity.model.Professor;
import com.henrique.escolaidiomas.domain.identity.model.Usuario;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/** RN-04: a gestao edita os dados de contato/repasse de um professor. */
@Service
@RequiredArgsConstructor
public class AtualizarProfessorUseCase {

    private final UsuarioRepository usuarioRepository;

    @Transactional
    public ProfessorDTO execute(UUID id, AtualizarProfessorInput input) {
        Professor professor = buscarProfessor(id);
        professor.atualizar(input.nome(), input.telefone(), input.chavePix(),
                input.dadosBancarios(), input.idiomasHabilitados());
        return ProfessorDTO.de((Professor) usuarioRepository.salvar(professor));
    }

    private Professor buscarProfessor(UUID id) {
        Usuario usuario = usuarioRepository.buscarPorId(id)
                .orElseThrow(() -> new NegocioException("Professor nao encontrado."));
        if (!(usuario instanceof Professor professor)) {
            throw new NegocioException("O usuario informado nao e' um professor.");
        }
        return professor;
    }
}
