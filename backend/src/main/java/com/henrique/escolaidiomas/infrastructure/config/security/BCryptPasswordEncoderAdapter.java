package com.henrique.escolaidiomas.infrastructure.config.security;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.identity.port.PasswordEncoderPort;

import lombok.RequiredArgsConstructor;

/** Adapta a porta de dominio ao PasswordEncoder (BCrypt) do Spring Security. */
@Component
@RequiredArgsConstructor
public class BCryptPasswordEncoderAdapter implements PasswordEncoderPort {

    private final PasswordEncoder springPasswordEncoder;

    @Override
    public String encode(String rawPassword) {
        return springPasswordEncoder.encode(rawPassword);
    }

    @Override
    public boolean matches(String rawPassword, String encodedPassword) {
        return springPasswordEncoder.matches(rawPassword, encodedPassword);
    }
}
