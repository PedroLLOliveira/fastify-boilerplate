# Spec 007: V2 Advanced Architectures (MVC & Clean)

## 1. Contexto e Problema
O Fastify Boilerplate V1 suportava nativamente as arquiteturas de pasta "MVC" e "Clean Architecture". Com a transição para a rigorosa arquitetura V2, o foco primário inicial foi estabilizar a arquitetura `modular` e seus perfis integrados de banco (`modular-postgres-kysely`, `modular-postgres-sequelize`).

Usuários legados que dependiam das organizações MVC (separação de responsabilidade horizontal baseada em `/controllers`, `/models`, `/views` ou `/routes`) e Clean Architecture (separação baseada em `core/domain/useCases/infrastructure`) ficaram limitados à V1, não desfrutando da segurança da engine moderna da V2.

## 2. Objetivos
- Introduzir o conceito explícito de `mvc` e `clean` como variações de *Profile base*.
- Fazer isso sem poluir a arquitetura modular existente, garantindo fronteiras fortes entre cada modelo organizacional.
- Permitir que esses perfis herdem corretamente as integrações de banco de dados por meio de perfis específicos (ex: `mvc-postgres-kysely`).

## 3. Escopo
- Especificar as convenções de pasta de MVC V2 em `docs/architecture/mvc.md`.
- Especificar as convenções de pasta de Clean Architecture V2 em `docs/architecture/clean.md`.
- Criar a matriz combinatória de perfis necessários (e.g. Minimal MVC, MVC Postgres, Minimal Clean, Clean Postgres).
- Criar templates `lib/v2/templates/mvc/` e `lib/v2/templates/clean/`.
- Reintegrar essas opções de arquitetura (`MVC`, `Clean`) nas perguntas do modo `Personalizado` do `bin/cli.js`.

## 4. O que não faz parte do escopo
- Forçar o uso de padrões monolíticos não aderentes à web moderna. O MVC será um REST API Controller-Service-Repository model.

## 5. Critérios de Aceite
- [ ] O CLI permite a seleção interativa entre Modular, MVC e Clean Architecture.
- [ ] A escolha de banco de dados e ORM ramifica e constrói o Profile arquitetural corretamente.
- [ ] Todas as novas arquiteturas providas cumprem estritamente as Runtime Contracts (Spec 004).
- [ ] Existe pelo menos um teste E2E (Eval) em `tests/v2/` focado em varrer uma API completa do fluxo MVC e da Clean Architecture.
