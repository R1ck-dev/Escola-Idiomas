package com.henrique.escolaidiomas.infrastructure.persistence.matricula.mapper;

import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.matricula.model.Matricula;
import com.henrique.escolaidiomas.infrastructure.persistence.matricula.entity.MatriculaJpaEntity;

@Component
public class MatriculaMapper {

    public MatriculaJpaEntity toEntity(Matricula matricula) {
        MatriculaJpaEntity entity = new MatriculaJpaEntity();
        entity.setId(matricula.getId());
        entity.setAlunoId(matricula.getAlunoId());
        entity.setTurmaId(matricula.getTurmaId());
        entity.setDataMatricula(matricula.getDataMatricula());
        entity.setStatus(matricula.getStatus());
        entity.setMotivoRejeicao(matricula.getMotivoRejeicao());
        return entity;
    }

    public Matricula toDomain(MatriculaJpaEntity entity) {
        return new Matricula(
                entity.getId(),
                entity.getAlunoId(),
                entity.getTurmaId(),
                entity.getDataMatricula(),
                entity.getStatus(),
                entity.getMotivoRejeicao());
    }
}
