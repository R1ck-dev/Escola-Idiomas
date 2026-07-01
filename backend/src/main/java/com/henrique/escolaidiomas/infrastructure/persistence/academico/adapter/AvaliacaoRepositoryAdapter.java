package com.henrique.escolaidiomas.infrastructure.persistence.academico.adapter;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.academico.enums.TipoAvaliacao;
import com.henrique.escolaidiomas.domain.academico.model.Avaliacao;
import com.henrique.escolaidiomas.domain.academico.port.AvaliacaoRepository;
import com.henrique.escolaidiomas.infrastructure.persistence.academico.mapper.AvaliacaoMapper;
import com.henrique.escolaidiomas.infrastructure.persistence.academico.repository.SpringDataAvaliacaoRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AvaliacaoRepositoryAdapter implements AvaliacaoRepository {

    private final SpringDataAvaliacaoRepository jpaRepository;
    private final AvaliacaoMapper mapper;

    @Override
    public Avaliacao salvar(Avaliacao avaliacao) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(avaliacao)));
    }

    @Override
    public Optional<Avaliacao> buscarPorMatriculaSemestreTipo(UUID matriculaId, UUID semestreId, TipoAvaliacao tipo) {
        return jpaRepository.findByMatriculaIdAndSemestreIdAndTipo(matriculaId, semestreId, tipo)
                .map(mapper::toDomain);
    }

    @Override
    public List<Avaliacao> listarPorMatriculaESemestre(UUID matriculaId, UUID semestreId) {
        return jpaRepository.findByMatriculaIdAndSemestreId(matriculaId, semestreId).stream()
                .map(mapper::toDomain).toList();
    }
}
