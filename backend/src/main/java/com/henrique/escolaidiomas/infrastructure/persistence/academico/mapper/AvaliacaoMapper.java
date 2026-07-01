package com.henrique.escolaidiomas.infrastructure.persistence.academico.mapper;

import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.academico.model.Avaliacao;
import com.henrique.escolaidiomas.infrastructure.persistence.academico.entity.AvaliacaoJpaEntity;

@Component
public class AvaliacaoMapper {

    public AvaliacaoJpaEntity toEntity(Avaliacao a) {
        AvaliacaoJpaEntity entity = new AvaliacaoJpaEntity();
        entity.setId(a.getId());
        entity.setMatriculaId(a.getMatriculaId());
        entity.setSemestreId(a.getSemestreId());
        entity.setTipo(a.getTipo());
        entity.setNota(a.getNota());
        return entity;
    }

    public Avaliacao toDomain(AvaliacaoJpaEntity entity) {
        return new Avaliacao(entity.getId(), entity.getMatriculaId(), entity.getSemestreId(),
                entity.getTipo(), entity.getNota());
    }
}
