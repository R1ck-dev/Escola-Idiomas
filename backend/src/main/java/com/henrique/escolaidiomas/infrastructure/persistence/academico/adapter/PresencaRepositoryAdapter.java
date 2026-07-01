package com.henrique.escolaidiomas.infrastructure.persistence.academico.adapter;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.academico.model.Presenca;
import com.henrique.escolaidiomas.domain.academico.port.PresencaRepository;
import com.henrique.escolaidiomas.infrastructure.persistence.academico.mapper.PresencaMapper;
import com.henrique.escolaidiomas.infrastructure.persistence.academico.repository.SpringDataPresencaRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PresencaRepositoryAdapter implements PresencaRepository {

    private final SpringDataPresencaRepository jpaRepository;
    private final PresencaMapper mapper;

    @Override
    public Presenca salvar(Presenca presenca) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(presenca)));
    }

    @Override
    public Optional<Presenca> buscarPorAulaEMatricula(UUID aulaId, UUID matriculaId) {
        return jpaRepository.findByAulaIdAndMatriculaId(aulaId, matriculaId).map(mapper::toDomain);
    }

    @Override
    public List<Presenca> listarPorAula(UUID aulaId) {
        return jpaRepository.findByAulaId(aulaId).stream().map(mapper::toDomain).toList();
    }

    @Override
    public long contarFaltasPorMatriculaESemestre(UUID matriculaId, UUID semestreId) {
        return jpaRepository.contarFaltasPorMatriculaESemestre(matriculaId, semestreId);
    }
}
