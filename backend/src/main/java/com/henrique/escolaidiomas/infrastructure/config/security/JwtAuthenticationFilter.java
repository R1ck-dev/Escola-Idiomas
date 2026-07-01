package com.henrique.escolaidiomas.infrastructure.config.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.henrique.escolaidiomas.domain.identity.port.TokenServicePort;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * Le o header Authorization: Bearer <jwt>, valida via TokenServicePort e popula o
 * SecurityContext (principal = id do usuario, authority = ROLE_<role>). Token
 * ausente/invalido apenas nao autentica; a autorizacao e' decidida adiante.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final TokenServicePort tokenServicePort;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String token = recuperarToken(request);

        if (token != null) {
            try {
                String subjectId = tokenServicePort.obterIdDoUsuario(token);
                String role = tokenServicePort.obterRoleDoUsuario(token);

                var authorities = List.of(new SimpleGrantedAuthority(role));
                var authentication = new UsernamePasswordAuthenticationToken(subjectId, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (Exception e) {
                // Assinatura invalida/expirada: segue sem autenticar.
            }
        }

        filterChain.doFilter(request, response);
    }

    private String recuperarToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.replace("Bearer ", "");
    }
}
