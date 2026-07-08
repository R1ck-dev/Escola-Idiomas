package com.henrique.escolaidiomas.infrastructure.config.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import lombok.RequiredArgsConstructor;

/**
 * Configuracao de seguranca stateless com JWT proprio (padrao IFConecta/CodeInsights).
 * Sem sessao, sem CSRF; erros de auth/autorizacao respondem em JSON.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JsonAuthenticationEntryPoint jsonAuthenticationEntryPoint;
    private final JsonAccessDeniedHandler jsonAccessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.POST, "/api/auth/login",
                                "/api/auth/recuperar-senha", "/api/auth/definir-senha").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/professores").hasRole("GESTAO")
                        .requestMatchers(HttpMethod.POST, "/api/professores").hasRole("GESTAO")
                        .requestMatchers(HttpMethod.PUT, "/api/professores/*").hasRole("GESTAO")
                        .requestMatchers(HttpMethod.POST, "/api/professores/*/reenviar-convite").hasRole("GESTAO")
                        // A pagina de matricula publica le a turma sem autenticacao (banner) — antes das regras restritivas.
                        .requestMatchers(HttpMethod.GET, "/api/turmas/*/publica").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/turmas").hasRole("GESTAO")
                        .requestMatchers(HttpMethod.PUT, "/api/turmas/**").hasRole("GESTAO")
                        // GET de turmas restrito a GESTAO/PROFESSOR (nunca ALUNO) — apos a rota publica.
                        .requestMatchers(HttpMethod.GET, "/api/turmas", "/api/turmas/**").hasAnyRole("GESTAO", "PROFESSOR")
                        .requestMatchers(HttpMethod.POST, "/api/matriculas").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/matriculas").hasRole("GESTAO")
                        .requestMatchers("/api/matriculas/**").hasRole("GESTAO")
                        .requestMatchers(HttpMethod.GET, "/api/mensalidades").hasRole("GESTAO")
                        // PIX/detalhe de uma mensalidade pela gestao (o aluno usa /api/alunos/me/**).
                        .requestMatchers(HttpMethod.GET, "/api/mensalidades/**").hasRole("GESTAO")
                        .requestMatchers(HttpMethod.POST, "/api/mensalidades/**").hasRole("GESTAO")
                        .requestMatchers("/api/despesas/**").hasRole("GESTAO")
                        // Semestre e' dado de referencia: ALUNO le a lista (seletor do boletim). Escrita segue GESTAO.
                        .requestMatchers(HttpMethod.GET, "/api/semestres").hasAnyRole("GESTAO", "PROFESSOR", "ALUNO")
                        .requestMatchers("/api/semestres/**").hasRole("GESTAO")
                        .requestMatchers("/api/chamadas/**").hasRole("PROFESSOR")
                        .requestMatchers("/api/notas/**").hasRole("PROFESSOR")
                        .requestMatchers("/api/boletins/**").hasAnyRole("GESTAO", "PROFESSOR")
                        .requestMatchers("/api/professores/me/**").hasRole("PROFESSOR")
                        // Busca de alunos (header da gestao): matcher de segmento unico, ANTES de /api/alunos/me/** (ALUNO).
                        .requestMatchers(HttpMethod.GET, "/api/alunos").hasRole("GESTAO")
                        .requestMatchers("/api/alunos/me/**").hasRole("ALUNO")
                        // Detalhe do aluno (GET /api/alunos/{id}) — GESTAO. Apos /me/** para nao capturar a area do aluno.
                        .requestMatchers(HttpMethod.GET, "/api/alunos/*").hasRole("GESTAO")
                        .requestMatchers("/jobs/**").permitAll()
                        .requestMatchers("/api/gestao/**").hasRole("GESTAO")
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jsonAuthenticationEntryPoint)
                        .accessDeniedHandler(jsonAccessDeniedHandler)
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
