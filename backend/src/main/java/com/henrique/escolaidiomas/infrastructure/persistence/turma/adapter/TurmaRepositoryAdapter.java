package com.henrique.escolaidiomas.infrastructure.persistence.turma.adapter;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.turma.model.Turma;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;
import com.henrique.escolaidiomas.infrastructure.persistence.turma.mapper.TurmaMapper;
import com.henrique.escolaidiomas.infrastructure.persistence.turma.repository.SpringDataTurmaRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class TurmaRepositoryAdapter implements TurmaRepository {

    private final SpringDataTurmaRepository springDataTurmaRepository;
    private final TurmaMapper turmaMapper;

    @Override
    public Turma salvar(Turma turma) {
        var entity = turmaMapper.toEntity(turma);
        var saved = springDataTurmaRepository.save(entity);
        return turmaMapper.toDomain(saved);
    }

    @Override
    public Optional<Turma> buscarPorId(UUID id) {
        return springDataTurmaRepository.findById(id).map(turmaMapper::toDomain);
    }

    @Override
    public List<Turma> listar() {
        return springDataTurmaRepository.findAll().stream().map(turmaMapper::toDomain).toList();
    }
}
