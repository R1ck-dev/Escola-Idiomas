package com.henrique.escolaidiomas.infrastructure.persistence.identity.mapper;

import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.identity.model.TokenVerificacao;
import com.henrique.escolaidiomas.infrastructure.persistence.identity.entity.TokenVerificacaoJpaEntity;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class TokenVerificacaoMapper {

    private final UsuarioMapper usuarioMapper;

    public TokenVerificacaoJpaEntity toEntity(TokenVerificacao domain) {
        TokenVerificacaoJpaEntity entity = new TokenVerificacaoJpaEntity();
        entity.setId(domain.getId());
        entity.setToken(domain.getToken());
        entity.setTipo(domain.getTipo());
        entity.setDataExpiracao(domain.getDataExpiracao());
        entity.setUtilizado(domain.isUtilizado());
        entity.setUsuario(usuarioMapper.toEntity(domain.getUsuario()));
        return entity;
    }

    public TokenVerificacao toDomain(TokenVerificacaoJpaEntity entity) {
        return new TokenVerificacao(
                entity.getId(),
                usuarioMapper.toDomain(entity.getUsuario()),
                entity.getToken(),
                entity.getDataExpiracao(),
                entity.isUtilizado(),
                entity.getTipo());
    }
}
