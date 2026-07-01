package com.henrique.escolaidiomas.infrastructure.persistence.academico.mapper;

import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.academico.model.Semestre;
import com.henrique.escolaidiomas.infrastructure.persistence.academico.entity.SemestreJpaEntity;

@Component
public class SemestreMapper {

    public SemestreJpaEntity toEntity(Semestre s) {
        SemestreJpaEntity entity = new SemestreJpaEntity();
        entity.setId(s.getId());
        entity.setReferencia(s.getReferencia());
        entity.setDataInicio(s.getDataInicio());
        entity.setDataFim(s.getDataFim());
        return entity;
    }

    public Semestre toDomain(SemestreJpaEntity entity) {
        return new Semestre(entity.getId(), entity.getReferencia(),
                entity.getDataInicio(), entity.getDataFim(), true);
    }
}
