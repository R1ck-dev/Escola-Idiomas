package com.henrique.escolaidiomas.application.identity.usecase;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.identity.dto.MeuPerfilDTO;
import com.henrique.escolaidiomas.domain.identity.model.Usuario;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/**
 * Retorna o perfil do usuario autenticado a partir do id extraido do JWT.
 */
@Service
@RequiredArgsConstructor
public class BuscarMeuPerfilUseCase {

    private final UsuarioRepository usuarioRepository;

    @Transactional
    public MeuPerfilDTO execute(UUID usuarioId) {
        Usuario usuario = usuarioRepository.buscarPorId(usuarioId)
                .orElseThrow(() -> new NegocioException("Usuario nao encontrado."));

        return new MeuPerfilDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getRole(),
                usuario.getStatus(),
                usuario.getCriadoEm());
    }
}
