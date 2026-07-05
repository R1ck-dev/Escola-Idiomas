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

    /**
     * Busca alunos cujo nome OU e-mail contenham o termo (case-insensitive), ordenados por nome
     * e limitados a {@code limite}. Termo nulo retorna os primeiros alunos por nome
     * (seletor/busca de aluno no header da gestao).
     */
    List<Usuario> buscarAlunosPorTermo(String termo, int limite);

    /**
     * IDs de todos os alunos cujo nome OU e-mail contenham o termo (case-insensitive). Usado
     * para resolver o filtro textual da gestao antes de paginar as matriculas (contextos
     * desacoplados: a matricula so guarda o id do aluno). Sem limite para nao perder resultados.
     */
    List<UUID> buscarIdsAlunosPorTermo(String termo);
}
