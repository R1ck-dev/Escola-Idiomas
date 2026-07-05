package com.henrique.escolaidiomas.infrastructure.persistence.identity.adapter;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.identity.enums.Role;
import com.henrique.escolaidiomas.domain.identity.model.Usuario;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.infrastructure.persistence.identity.mapper.UsuarioMapper;
import com.henrique.escolaidiomas.infrastructure.persistence.identity.repository.SpringDataAlunoRepository;
import com.henrique.escolaidiomas.infrastructure.persistence.identity.repository.SpringDataUsuarioRepository;

import lombok.RequiredArgsConstructor;

/** Adapter de saida: implementa a porta de dominio delegando ao Spring Data + Mapper. */
@Component
@RequiredArgsConstructor
public class UsuarioRepositoryAdapter implements UsuarioRepository {

    private final SpringDataUsuarioRepository springDataUsuarioRepository;
    private final SpringDataAlunoRepository springDataAlunoRepository;
    private final UsuarioMapper usuarioMapper;

    @Override
    public Usuario salvar(Usuario usuario) {
        var entity = usuarioMapper.toEntity(usuario);
        var saved = springDataUsuarioRepository.save(entity);
        return usuarioMapper.toDomain(saved);
    }

    @Override
    public Optional<Usuario> buscarPorId(UUID id) {
        return springDataUsuarioRepository.findById(id).map(usuarioMapper::toDomain);
    }

    @Override
    public Optional<Usuario> buscarPorEmail(String email) {
        return springDataUsuarioRepository.findByEmail(email).map(usuarioMapper::toDomain);
    }

    @Override
    public boolean existePorEmail(String email) {
        return springDataUsuarioRepository.existsByEmail(email);
    }

    @Override
    public Optional<Usuario> buscarAlunoPorCpf(String cpf) {
        return springDataAlunoRepository.findByCpf(cpf).map(usuarioMapper::toDomain);
    }

    @Override
    public List<Usuario> listarPorRole(Role role) {
        return springDataUsuarioRepository.findByRole(role).stream().map(usuarioMapper::toDomain).toList();
    }

    @Override
    public List<Usuario> buscarAlunosPorTermo(String termo, int limite) {
        return springDataAlunoRepository.buscarPorTermo(termo, PageRequest.of(0, limite))
                .stream().map(usuarioMapper::toDomain).toList();
    }

    @Override
    public List<UUID> buscarIdsAlunosPorTermo(String termo) {
        return springDataAlunoRepository.buscarIdsPorTermo(termo);
    }
}
