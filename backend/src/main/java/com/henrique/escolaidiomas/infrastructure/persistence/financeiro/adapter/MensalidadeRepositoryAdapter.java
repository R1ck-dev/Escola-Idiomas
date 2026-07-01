package com.henrique.escolaidiomas.infrastructure.persistence.financeiro.adapter;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.financeiro.model.Mensalidade;
import com.henrique.escolaidiomas.domain.financeiro.port.MensalidadeRepository;
import com.henrique.escolaidiomas.infrastructure.persistence.financeiro.mapper.MensalidadeMapper;
import com.henrique.escolaidiomas.infrastructure.persistence.financeiro.repository.SpringDataMensalidadeRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MensalidadeRepositoryAdapter implements MensalidadeRepository {

    private final SpringDataMensalidadeRepository jpaRepository;
    private final MensalidadeMapper mapper;

    @Override
    public Mensalidade salvar(Mensalidade mensalidade) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(mensalidade)));
    }

    @Override
    public Optional<Mensalidade> buscarPorId(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Mensalidade> listarPorMatricula(UUID matriculaId) {
        return jpaRepository.findByMatriculaId(matriculaId).stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<Mensalidade> listarPorCompetencia(String competencia) {
        return jpaRepository.findByCompetencia(competencia).stream().map(mapper::toDomain).toList();
    }

    @Override
    public boolean existePorMatriculaECompetencia(UUID matriculaId, String competencia) {
        return jpaRepository.existsByMatriculaIdAndCompetencia(matriculaId, competencia);
    }
}
