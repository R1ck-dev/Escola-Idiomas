package com.henrique.escolaidiomas.infrastructure.persistence.financeiro.adapter;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.financeiro.model.Despesa;
import com.henrique.escolaidiomas.domain.financeiro.port.DespesaRepository;
import com.henrique.escolaidiomas.infrastructure.persistence.financeiro.mapper.DespesaMapper;
import com.henrique.escolaidiomas.infrastructure.persistence.financeiro.repository.SpringDataDespesaRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DespesaRepositoryAdapter implements DespesaRepository {

    private final SpringDataDespesaRepository jpaRepository;
    private final DespesaMapper mapper;

    @Override
    public Despesa salvar(Despesa despesa) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(despesa)));
    }

    @Override
    public Optional<Despesa> buscarPorId(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Despesa> listarPorPeriodo(LocalDate inicio, LocalDate fim) {
        return jpaRepository.findByDataBetweenOrderByDataAsc(inicio, fim).stream()
                .map(mapper::toDomain).toList();
    }

    @Override
    public List<Despesa> listarPorProfessor(UUID professorId) {
        return jpaRepository.findByProfessorIdOrderByDataDesc(professorId).stream()
                .map(mapper::toDomain).toList();
    }

    @Override
    public void excluir(UUID id) {
        jpaRepository.deleteById(id);
    }
}
