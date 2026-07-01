package com.henrique.escolaidiomas.infrastructure.persistence.financeiro.mapper;

import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.financeiro.model.Despesa;
import com.henrique.escolaidiomas.infrastructure.persistence.financeiro.entity.DespesaJpaEntity;

@Component
public class DespesaMapper {

    public DespesaJpaEntity toEntity(Despesa d) {
        DespesaJpaEntity entity = new DespesaJpaEntity();
        entity.setId(d.getId());
        entity.setDescricao(d.getDescricao());
        entity.setCategoria(d.getCategoria());
        entity.setValor(d.getValor());
        entity.setData(d.getData());
        entity.setProfessorId(d.getProfessorId());
        return entity;
    }

    public Despesa toDomain(DespesaJpaEntity entity) {
        return new Despesa(
                entity.getId(),
                entity.getDescricao(),
                entity.getCategoria(),
                entity.getValor(),
                entity.getData(),
                entity.getProfessorId());
    }
}
