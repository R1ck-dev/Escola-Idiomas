package com.henrique.escolaidiomas.infrastructure.persistence.academico.mapper;

import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.academico.model.Presenca;
import com.henrique.escolaidiomas.infrastructure.persistence.academico.entity.PresencaJpaEntity;

@Component
public class PresencaMapper {

    public PresencaJpaEntity toEntity(Presenca p) {
        PresencaJpaEntity entity = new PresencaJpaEntity();
        entity.setId(p.getId());
        entity.setAulaId(p.getAulaId());
        entity.setMatriculaId(p.getMatriculaId());
        entity.setPresente(p.isPresente());
        return entity;
    }

    public Presenca toDomain(PresencaJpaEntity entity) {
        return new Presenca(entity.getId(), entity.getAulaId(), entity.getMatriculaId(), entity.isPresente());
    }
}
