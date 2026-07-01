package com.henrique.escolaidiomas.infrastructure.persistence.academico.adapter;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.academico.model.Semestre;
import com.henrique.escolaidiomas.domain.academico.port.SemestreRepository;
import com.henrique.escolaidiomas.infrastructure.persistence.academico.mapper.SemestreMapper;
import com.henrique.escolaidiomas.infrastructure.persistence.academico.repository.SpringDataSemestreRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SemestreRepositoryAdapter implements SemestreRepository {

    private final SpringDataSemestreRepository jpaRepository;
    private final SemestreMapper mapper;

    @Override
    public Semestre salvar(Semestre semestre) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(semestre)));
    }

    @Override
    public Optional<Semestre> buscarPorId(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<Semestre> buscarPorReferencia(String referencia) {
        return jpaRepository.findByReferencia(referencia).map(mapper::toDomain);
    }

    @Override
    public List<Semestre> listar() {
        return jpaRepository.findAll().stream().map(mapper::toDomain).toList();
    }

    @Override
    public Optional<Semestre> buscarVigente(LocalDate data) {
        return jpaRepository
                .findFirstByDataInicioLessThanEqualAndDataFimGreaterThanEqual(data, data)
                .map(mapper::toDomain);
    }
}
