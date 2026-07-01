package com.henrique.escolaidiomas.infrastructure.persistence.turma.mapper;

import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.turma.model.Turma;
import com.henrique.escolaidiomas.infrastructure.persistence.turma.entity.TurmaJpaEntity;

@Component
public class TurmaMapper {

    public TurmaJpaEntity toEntity(Turma turma) {
        TurmaJpaEntity entity = new TurmaJpaEntity();
        entity.setId(turma.getId());
        entity.setProfessorId(turma.getProfessorId());
        entity.setNome(turma.getNome());
        entity.setIdioma(turma.getIdioma());
        entity.setNivel(turma.getNivel());
        entity.setDiasSemana(turma.getDiasSemana());
        entity.setHoraInicio(turma.getHoraInicio());
        entity.setHoraFim(turma.getHoraFim());
        entity.setValorMensalidade(turma.getValorMensalidade());
        entity.setLotacaoMaxima(turma.getLotacaoMaxima());
        entity.setAtiva(turma.isAtiva());
        return entity;
    }

    public Turma toDomain(TurmaJpaEntity entity) {
        return new Turma(
                entity.getId(),
                entity.getProfessorId(),
                entity.getNome(),
                entity.getIdioma(),
                entity.getNivel(),
                entity.getDiasSemana(),
                entity.getHoraInicio(),
                entity.getHoraFim(),
                entity.getValorMensalidade(),
                entity.getLotacaoMaxima(),
                entity.isAtiva());
    }
}
