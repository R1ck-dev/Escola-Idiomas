package com.henrique.escolaidiomas.domain.identity.port;

/**
 * Porta de hashing de senha. Isola o dominio da implementacao (BCrypt).
 */
public interface PasswordEncoderPort {
    String encode(String rawPassword);
    boolean matches(String rawPassword, String encodedPassword);
}
