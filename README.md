# Escola de Idiomas — Sistema de Gestão

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-2b2b2b?logo=openjdk&logoColor=white" />
  <img src="https://img.shields.io/badge/Spring%20Boot-4-2b2b2b?logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-2b2b2b?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-2b2b2b?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-2b2b2b?logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Arquitetura-Hexagonal-2b2b2b" />
  <img src="https://img.shields.io/badge/status-em%20desenvolvimento-orange" />
</p>

Sistema de gestão completo para uma escola de idiomas: matrículas, turmas, chamada, boletim e o módulo financeiro — com geração de boleto no padrão FEBRABAN e cobrança via PIX dinâmico.

> **Status:** em desenvolvimento. O backend está funcional nos seis contextos; o frontend cobre os fluxos principais. Ainda há atalhos de desenvolvimento no código (ex.: simulação de pagamento) que serão removidos antes de qualquer uso real.

---

## O que este projeto realmente é

Este projeto é um **exercício de simulação de Software House**. Ele não nasceu de um enunciado técnico pronto, e sim de um **levantamento de requisitos conduzido com um cliente fictício** — um agente de IA que faz o papel de um dono de escola de idiomas, leigo em tecnologia, que só sabe descrever as próprias dores.

O objetivo do exercício não é só escrever código: é treinar a parte que normalmente fica de fora dos projetos de portfólio.

- **Extrair a dor real por trás do pedido.** Cliente não pede "um CRUD de matrícula"; ele diz que perde aluno porque a turma lota e ninguém avisa. Disso nasceu a lista de espera.
- **Transformar conversa em requisito.** As regras de negócio são numeradas (RN-XX) e rastreáveis até a conversa que as originou.
- **Registrar as decisões.** Cada escolha de arquitetura vira um ADR, explicando por que aquele caminho e não outro.

O processo é documentado por fases: levantamento → requisitos → arquitetura → infraestrutura → decisões. Essa documentação é interna e **não é versionada neste repositório** — o que se vê aqui é o resultado dela.

---

## Funcionalidades

### Matrícula

Fluxo completo de entrada do aluno: cadastro com responsável, aprovação, **lista de espera** quando a turma está cheia, encerramento e cobrança **pro-rata** da primeira mensalidade quando a matrícula é efetivada no meio do mês.

### Acadêmico

- **Chamada** — restrita aos dias de aula da turma, com registro de presença aula a aula.
- **Boletim** — lançamento de notas, apuração e consulta pelo aluno.
- **Frequência** — acompanhamento aula a aula, com o limite de faltas aplicado como regra de domínio.

### Financeiro

O módulo mais denso do sistema.

- **Mensalidades** — geração mensal automática, baixa de pagamento e estorno de baixa.
- **Boleto bancário** — geração no padrão **FEBRABAN**, com a linha digitável montada segundo a especificação.
- **PIX dinâmico** — geração da cobrança e do QR Code, com confirmação de pagamento.
- **Entrega por WhatsApp** — envio do boleto ao responsável.
- **Despesas** — registro e acompanhamento dos custos da escola.
- **Painel financeiro** — visão consolidada de receitas e despesas.

### Gestão

Cadastro e edição de professores, criação de semestres e turmas, turma pública (página de inscrição) e dashboard administrativo.

### Identidade

Autenticação com JWT stateless, definição de senha via token enviado por e-mail e controle de acesso por papel.

---

## Arquitetura

**Arquitetura Hexagonal / Clean**, com empacotamento *layer-first*: o primeiro nível é a **camada**, o segundo é o **contexto de negócio**.

```
com.henrique.escolaidiomas/
├── domain/<contexto>/          # Java puro — sem Spring, sem JPA
│   ├── model/                  # entidades e agregados
│   ├── port/                   # interfaces que a infraestrutura implementa
│   └── enums/
├── application/<contexto>/
│   ├── usecase/                # um caso de uso por operação
│   ├── service/
│   └── dto/
└── infrastructure/
    ├── web/                    # controllers REST
    ├── persistence/            # entidades JPA, repositórios, adapters e mappers
    └── config/
```

Contextos: **`identity`**, **`matricula`**, **`turma`**, **`academico`**, **`financeiro`** e **`gestao`**.

As dependências apontam **sempre para dentro** — o domínio não conhece Spring nem JPA. Ele declara as portas (`port/`) e a infraestrutura as implementa. Isso vale inclusive para o financeiro: a lógica de montagem do boleto FEBRABAN e da cobrança PIX vive em `domain/financeiro/boleto` e `domain/financeiro/pix`, como regra de negócio pura, independente de qualquer framework ou provedor.

O efeito prático é que adicionar uma feature nova segue sempre o mesmo trilho — Controller → UseCase → Port → Adapter → Repository → Entity — em vez de reinventar a estrutura a cada caso.

---

## Stack

**Back-end**
- Java 21, Spring Boot 4
- Spring Web MVC, Spring Data JPA, Spring Security, Spring Validation, Spring Mail
- PostgreSQL + Flyway (migrações versionadas)
- JWT stateless (`jjwt`)
- Testes automatizados (JPA, Security e Web MVC)

**Front-end**
- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Radix UI
- TanStack Query
- React Hook Form
- `qrcode.react` (QR Code do PIX)

**Infra**
- Docker / Docker Compose

---

## Como rodar

### Pré-requisitos

- JDK 21
- Docker + Docker Compose
- Node.js 18+ e npm

### Passos

```bash
# 1. Sobe a infra local (PostgreSQL)
docker compose up -d

# 2. Back-end
cd backend
./mvnw spring-boot:run        # :8080

# 3. Front-end
cd frontend
npm install
npm run dev                   # :5173
```

---

## Autor

Desenvolvido por Henrique.

- GitHub: [https://github.com/R1ck-dev](https://github.com/R1ck-dev)
- E-mail: [henriquemarangoni.inacio1108@gmail.com](mailto:henriquemarangoni.inacio1108@gmail.com)
- LinkedIn: [https://www.linkedin.com/in/henrique-marangoni-484845239/](https://www.linkedin.com/in/henrique-marangoni-484845239/)
