package com.henrique.escolaidiomas.infrastructure.persistence.matricula.adapter;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.matricula.enums.StatusMatricula;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;
import com.henrique.escolaidiomas.infrastructure.persistence.matricula.mapper.MatriculaMapper;
import com.henrique.escolaidiomas.infrastructure.persistence.matricula.repository.SpringDataMatriculaRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MatriculaRepositoryAdapter implements MatriculaRepository {

    private final SpringDataMatriculaRepository jpaRepository;
    private final MatriculaMapper mapper;

    @Override
    public Matricula salvar(Matricula matricula) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(matricula)));
    }

    @Override
    public Optional<Matricula> buscarPorId(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Matricula> listar() {
        return jpaRepository.findAll().stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<Matricula> listarPorStatus(StatusMatricula status) {
        return jpaRepository.findByStatus(status).stream().map(mapper::toDomain).toList();
    }

    @Override
    public long contarAtivasPorTurma(UUID turmaId) {
        return jpaRepository.countByTurmaIdAndStatus(turmaId, StatusMatricula.ATIVA);
    }

    @Override
    public boolean existeAtivaOuPendente(UUID alunoId, UUID turmaId) {
        return jpaRepository.existsByAlunoIdAndTurmaIdAndStatusIn(alunoId, turmaId,
                List.of(StatusMatricula.ATIVA, StatusMatricula.AGUARDANDO_APROVACAO));
    }
}
