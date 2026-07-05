package com.henrique.escolaidiomas.infrastructure.persistence.financeiro.adapter;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.financeiro.enums.StatusMensalidade;
import com.henrique.escolaidiomas.domain.financeiro.model.Mensalidade;
import com.henrique.escolaidiomas.domain.financeiro.port.MensalidadeRepository;
import com.henrique.escolaidiomas.infrastructure.persistence.financeiro.entity.MensalidadeJpaEntity;
import com.henrique.escolaidiomas.infrastructure.persistence.financeiro.mapper.MensalidadeMapper;
import com.henrique.escolaidiomas.infrastructure.persistence.financeiro.repository.SpringDataMensalidadeRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MensalidadeRepositoryAdapter implements MensalidadeRepository {

    /** Situacoes persistidas "finais" — as demais (ABERTA) tem a situacao derivada do vencimento. */
    private static final List<StatusMensalidade> STATUS_FINAIS =
            List.of(StatusMensalidade.PAGA, StatusMensalidade.CANCELADA);

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

    @Override
    public Page<Mensalidade> buscarPainel(String competencia, StatusMensalidade situacao, LocalDate hoje,
            Pageable pageable) {
        Page<MensalidadeJpaEntity> pagina;
        if (situacao == null) {
            pagina = jpaRepository.findByCompetencia(competencia, pageable);
        } else {
            pagina = switch (situacao) {
                case PAGA, CANCELADA -> jpaRepository.findByCompetenciaAndStatus(competencia, situacao, pageable);
                case ABERTA -> jpaRepository.buscarEmDia(competencia, STATUS_FINAIS, hoje, pageable);
                case ATRASADA -> jpaRepository.buscarAtrasadas(competencia, STATUS_FINAIS, hoje, pageable);
            };
        }
        return pagina.map(mapper::toDomain);
    }

    @Override
    public List<Mensalidade> listarEmAberto() {
        return jpaRepository.findByStatus(StatusMensalidade.ABERTA).stream().map(mapper::toDomain).toList();
    }
}
