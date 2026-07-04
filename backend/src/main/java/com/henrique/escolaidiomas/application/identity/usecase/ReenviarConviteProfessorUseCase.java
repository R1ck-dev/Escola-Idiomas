package com.henrique.escolaidiomas.application.identity.usecase;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.domain.identity.model.Professor;
import com.henrique.escolaidiomas.domain.identity.model.Usuario;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/**
 * RN-39: reenvia o convite de 1o acesso de um professor. Reusa exatamente o mesmo
 * mecanismo do cadastro ({@link ProvisionarPrimeiroAcessoUseCase}): gera um novo
 * token de ATIVACAO e dispara o e-mail com o link de definicao de senha.
 */
@Service
@RequiredArgsConstructor
public class ReenviarConviteProfessorUseCase {

    private final UsuarioRepository usuarioRepository;
    private final ProvisionarPrimeiroAcessoUseCase provisionarPrimeiroAcesso;

    @Transactional
    public void execute(UUID id) {
        Usuario usuario = usuarioRepository.buscarPorId(id)
                .orElseThrow(() -> new NegocioException("Professor nao encontrado."));
        if (!(usuario instanceof Professor)) {
            throw new NegocioException("O usuario informado nao e' um professor.");
        }
        provisionarPrimeiroAcesso.execute(usuario);
    }
}
