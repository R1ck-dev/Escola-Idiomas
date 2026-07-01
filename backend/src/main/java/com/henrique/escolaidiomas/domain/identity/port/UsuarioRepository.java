package com.henrique.escolaidiomas.domain.identity.port;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.identity.enums.Role;
import com.henrique.escolaidiomas.domain.identity.model.Usuario;

/**
 * Porta de saida para persistencia de usuarios. Implementada por um adapter na
 * camada de infraestrutura. O dominio nao conhece JPA.
 */
public interface UsuarioRepository {
    Usuario salvar(Usuario usuario);
    Optional<Usuario> buscarPorId(UUID id);
    Optional<Usuario> buscarPorEmail(String email);
    boolean existePorEmail(String email);

    /** Busca um aluno pelo CPF (para reusar o cadastro em novas matriculas — RN-08). */
    Optional<Usuario> buscarAlunoPorCpf(String cpf);

    /** Usuarios de um perfil (ex.: destinatarios GESTAO do alerta de inadimplencia — RN-29). */
    List<Usuario> listarPorRole(Role role);
}
