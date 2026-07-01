package com.henrique.escolaidiomas.infrastructure.persistence.identity.adapter;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.identity.model.Responsavel;
import com.henrique.escolaidiomas.domain.identity.port.ResponsavelRepository;
import com.henrique.escolaidiomas.infrastructure.persistence.identity.mapper.ResponsavelMapper;
import com.henrique.escolaidiomas.infrastructure.persistence.identity.repository.SpringDataResponsavelRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ResponsavelRepositoryAdapter implements ResponsavelRepository {

    private final SpringDataResponsavelRepository jpaRepository;
    private final ResponsavelMapper mapper;

    @Override
    public Responsavel salvar(Responsavel responsavel) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(responsavel)));
    }

    @Override
    public Optional<Responsavel> buscarPorId(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<Responsavel> buscarPorCpf(String cpf) {
        return jpaRepository.findByCpf(cpf).map(mapper::toDomain);
    }
}
