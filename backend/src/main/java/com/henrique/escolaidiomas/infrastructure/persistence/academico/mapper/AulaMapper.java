package com.henrique.escolaidiomas.infrastructure.persistence.academico.mapper;

import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.academico.model.Aula;
import com.henrique.escolaidiomas.infrastructure.persistence.academico.entity.AulaJpaEntity;

@Component
public class AulaMapper {

    public AulaJpaEntity toEntity(Aula a) {
        AulaJpaEntity entity = new AulaJpaEntity();
        entity.setId(a.getId());
        entity.setTurmaId(a.getTurmaId());
        entity.setSemestreId(a.getSemestreId());
        entity.setData(a.getData());
        return entity;
    }

    public Aula toDomain(AulaJpaEntity entity) {
        return new Aula(entity.getId(), entity.getTurmaId(), entity.getSemestreId(), entity.getData());
    }
}
