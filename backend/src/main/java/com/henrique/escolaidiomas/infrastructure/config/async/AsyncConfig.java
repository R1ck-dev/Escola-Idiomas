package com.henrique.escolaidiomas.infrastructure.config.async;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/** Habilita @Async (usado no envio de e-mails para nao bloquear a requisicao). */
@Configuration
@EnableAsync
public class AsyncConfig {
}
