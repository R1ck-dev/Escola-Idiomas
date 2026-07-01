package com.henrique.escolaidiomas.infrastructure.config.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.henrique.escolaidiomas.domain.identity.model.Gestao;
import com.henrique.escolaidiomas.domain.identity.port.PasswordEncoderPort;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Cria o primeiro gestor (conta ATIVA) na subida da app, para que haja com quem
 * fazer login. Controlado por app.seed.gestao.*; se a senha estiver vazia, nao
 * cria nada (evita conta com senha default em producao).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GestaoSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoderPort passwordEncoder;

    @Value("${app.seed.gestao.nome:Gestor Padrao}")
    private String nome;

    @Value("${app.seed.gestao.email:}")
    private String email;

    @Value("${app.seed.gestao.password:}")
    private String password;

    @Override
    public void run(String... args) {
        if (!StringUtils.hasText(email) || !StringUtils.hasText(password)) {
            log.info("Seed do gestor desabilitado (email/senha nao configurados). Pulando.");
            return;
        }

        if (usuarioRepository.existePorEmail(email)) {
            log.info("Gestor '{}' ja existe. Nenhuma acao necessaria.", email);
            return;
        }

        Gestao gestor = new Gestao(null, nome, email, passwordEncoder.encode(password));
        gestor.ativarConta();
        usuarioRepository.salvar(gestor);

        log.info("Gestor inicial '{}' criado com sucesso.", email);
    }
}
