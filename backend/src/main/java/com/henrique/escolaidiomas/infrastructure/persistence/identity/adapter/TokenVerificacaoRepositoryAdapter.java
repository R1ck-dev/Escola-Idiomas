package com.henrique.escolaidiomas.infrastructure.persistence.identity.adapter;

import java.util.Optional;

import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.identity.model.TokenVerificacao;
import com.henrique.escolaidiomas.domain.identity.port.TokenVerificacaoRepository;
import com.henrique.escolaidiomas.infrastructure.persistence.identity.mapper.TokenVerificacaoMapper;
import com.henrique.escolaidiomas.infrastructure.persistence.identity.repository.SpringDataTokenVerificacaoRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class TokenVerificacaoRepositoryAdapter implements TokenVerificacaoRepository {

    private final SpringDataTokenVerificacaoRepository jpaRepository;
    private final TokenVerificacaoMapper mapper;

    @Override
    public TokenVerificacao salvar(TokenVerificacao token) {
        var entity = mapper.toEntity(token);
        var saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<TokenVerificacao> buscarPorToken(String token) {
        return jpaRepository.findByToken(token).map(mapper::toDomain);
    }
}
