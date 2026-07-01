package com.henrique.escolaidiomas.infrastructure.config.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.identity.model.Usuario;
import com.henrique.escolaidiomas.domain.identity.port.TokenServicePort;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * Implementacao de TokenServicePort com JJWT (HS256). subject = e-mail; claims
 * id (UUID) e role (ROLE_<perfil>); expiracao configuravel. Sem refresh token.
 */
@Component
public class JwtTokenAdapter implements TokenServicePort {

    @Value("${api.security.jwt.secret}")
    private String secret;

    @Value("${api.security.jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    @Override
    public String gerarToken(Usuario usuario) {
        return Jwts.builder()
                .subject(usuario.getEmail())
                .claim("id", usuario.getId().toString())
                .claim("role", "ROLE_" + usuario.getRole().name())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSecretKey())
                .compact();
    }

    @Override
    public String obterIdDoUsuario(String token) {
        return Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("id", String.class);
    }

    @Override
    public String obterRoleDoUsuario(String token) {
        return Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("role", String.class);
    }
}
