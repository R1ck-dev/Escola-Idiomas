package com.henrique.escolaidiomas.infrastructure.persistence.identity.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

/**
 * Subtipo de usuario com perfil de gestao. Na estrategia JOINED nao gera id proprio:
 * usuario_id e' a mesma PK do usuario base. Sem colunas especificas nesta fatia.
 */
@Entity
@Table(name = "gestao")
@PrimaryKeyJoinColumn(name = "usuario_id")
public class GestaoJpaEntity extends UsuarioJpaEntity {
}
