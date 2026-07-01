package com.henrique.escolaidiomas.domain.shared;

/**
 * Excecao de regra de negocio. E' traduzida para HTTP 400 com corpo {"erro": "..."}
 * pelo GlobalExceptionHandler. Lancada pelo dominio e pelos casos de uso.
 */
public class NegocioException extends RuntimeException {
    public NegocioException(String message) {
        super(message);
    }
}
