package com.henrique.escolaidiomas.infrastructure.persistence.identity.mapper;

import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.identity.model.Responsavel;
import com.henrique.escolaidiomas.infrastructure.persistence.identity.entity.ResponsavelJpaEntity;

@Component
public class ResponsavelMapper {

    public ResponsavelJpaEntity toEntity(Responsavel domain) {
        ResponsavelJpaEntity entity = new ResponsavelJpaEntity();
        entity.setId(domain.getId());
        entity.setNome(domain.getNome());
        entity.setCpf(domain.getCpf());
        entity.setTelefone(domain.getTelefone());
        entity.setEmail(domain.getEmail());
        return entity;
    }

    public Responsavel toDomain(ResponsavelJpaEntity entity) {
        return new Responsavel(
                entity.getId(),
                entity.getNome(),
                entity.getCpf(),
                entity.getTelefone(),
                entity.getEmail());
    }
}
