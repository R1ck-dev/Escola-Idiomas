package com.henrique.escolaidiomas.infrastructure.persistence.academico.adapter;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.academico.model.Aula;
import com.henrique.escolaidiomas.domain.academico.port.AulaRepository;
import com.henrique.escolaidiomas.infrastructure.persistence.academico.mapper.AulaMapper;
import com.henrique.escolaidiomas.infrastructure.persistence.academico.repository.SpringDataAulaRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AulaRepositoryAdapter implements AulaRepository {

    private final SpringDataAulaRepository jpaRepository;
    private final AulaMapper mapper;

    @Override
    public Aula salvar(Aula aula) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(aula)));
    }

    @Override
    public Optional<Aula> buscarPorId(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<Aula> buscarPorTurmaSemestreEData(UUID turmaId, UUID semestreId, LocalDate data) {
        return jpaRepository.findByTurmaIdAndSemestreIdAndData(turmaId, semestreId, data).map(mapper::toDomain);
    }

    @Override
    public long contarPorTurmaESemestre(UUID turmaId, UUID semestreId) {
        return jpaRepository.countByTurmaIdAndSemestreId(turmaId, semestreId);
    }

    @Override
    public List<Aula> listarPorTurmaESemestre(UUID turmaId, UUID semestreId) {
        return jpaRepository.findByTurmaIdAndSemestreIdOrderByDataAsc(turmaId, semestreId).stream()
                .map(mapper::toDomain).toList();
    }
}
