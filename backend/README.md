# EscolaIdiomas — Backend

API REST (Spring Boot 4 / Java 21) do sistema de gestão da Escola de Idiomas.
Arquitetura **hexagonal** e autenticação **JWT** seguindo os padrões de
`Docs/03-arquitetura/Padroes-de-Arquitetura.md`.

## Pré-requisitos

- **JDK 21**
- **Maven 3.9+** (ou use o wrapper `./mvnw` quando gerado)
- **PostgreSQL** (local ou Supabase free)
- *(opcional)* um SMTP de teste (ex.: [Mailpit](https://github.com/axllent/mailpit)) — só será usado na fatia de e-mail

## Configuração

1. Copie o template de variáveis e preencha:
   ```bash
   cp ../.env.example ../.env
   ```
   Mínimo para subir: `DATABASE_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` (≥ 32 bytes).
   Para conseguir logar já na primeira subida, preencha também
   `SEED_GESTAO_EMAIL` e `SEED_GESTAO_PASSWORD` (o seeder cria um gestor **ativo**).

2. Exporte as variáveis do `.env` no shell (ou configure-as no painel do Render).

## Rodar

```bash
mvn spring-boot:run
```

- O **Flyway** aplica as migrações (`src/main/resources/db/migration`) na subida.
- `spring.jpa.hibernate.ddl-auto=validate`: o Hibernate **valida** o schema contra as
  entidades — quem cria/altera tabela é o Flyway, nunca o Hibernate.
- API em `http://localhost:8080`. Swagger UI em `http://localhost:8080/swagger-ui.html`.

## Endpoints desta fatia (identity / login)

| Método | Rota                | Auth        | Descrição                          |
|--------|---------------------|-------------|------------------------------------|
| POST   | `/api/auth/login`   | público     | Autentica e devolve um JWT (24h)   |
| GET    | `/api/usuarios/me`  | Bearer JWT  | Perfil do usuário autenticado      |

### Exemplo

```bash
# 1) login (usa o gestor semeado)
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gestao@escolaidiomas.local","password":"SUA_SENHA"}'
# -> { "token": "<jwt>", "tipo": "Bearer" }

# 2) perfil
curl http://localhost:8080/api/usuarios/me \
  -H "Authorization: Bearer <jwt>"
```

## Estrutura (hexagonal, por camada → bounded context)

```
domain/          # nucleo puro (sem Spring/JPA): model, port, enums, exception
application/     # casos de uso + DTOs de entrada/saida
infrastructure/  # adapters + config
  config/{security,web,exception,openapi}
  persistence/<context>/{entity,repository,adapter,mapper}
  web/<context>/{controller,dto}
```

Contexto implementado: **identity** (`Usuario` abstrato + `Gestao`, login/JWT).
Próximas fatias adicionam `Aluno`/`Professor`, ativação por e-mail e os demais contextos.

## Autenticação (resumo)

- JWT único **HS256**, 24h, **sem refresh token** (logout = descartar o token no cliente).
- `subject` = e-mail; claims `id` (UUID) e `role` (`ROLE_<perfil>`).
- Senha com **BCrypt**; erros 401/403 em JSON (`{"erro": ...}`).
