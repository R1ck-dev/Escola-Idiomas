package com.henrique.escolaidiomas.infrastructure.config.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Injeta o UUID do usuario autenticado num parametro de metodo de controller.
 * Resolvido por {@link CurrentUserIdArgumentResolver}.
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentUserId {
}
