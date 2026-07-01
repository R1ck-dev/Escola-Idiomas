package com.henrique.escolaidiomas.infrastructure.persistence.financeiro.mapper;

import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.financeiro.model.Mensalidade;
import com.henrique.escolaidiomas.infrastructure.persistence.financeiro.entity.MensalidadeJpaEntity;

@Component
public class MensalidadeMapper {

    public MensalidadeJpaEntity toEntity(Mensalidade m) {
        MensalidadeJpaEntity entity = new MensalidadeJpaEntity();
        entity.setId(m.getId());
        entity.setMatriculaId(m.getMatriculaId());
        entity.setCompetencia(m.getCompetencia());
        entity.setValorBase(m.getValorBase());
        entity.setPercentual(m.getPercentual());
        entity.setVencimento(m.getVencimento());
        entity.setStatus(m.getStatus());
        entity.setDataPagamento(m.getDataPagamento());
        entity.setProrata(m.isProrata());
        return entity;
    }

    public Mensalidade toDomain(MensalidadeJpaEntity entity) {
        return new Mensalidade(
                entity.getId(),
                entity.getMatriculaId(),
                entity.getCompetencia(),
                entity.getValorBase(),
                entity.getPercentual(),
                entity.getVencimento(),
                entity.getStatus(),
                entity.getDataPagamento(),
                entity.isProrata());
    }
}
