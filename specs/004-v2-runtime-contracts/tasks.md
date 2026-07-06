# Tarefas — V2 Runtime Contracts

## Padronização Fastify Base (Minimal)
- [ ] T001: Atualizar template `app.ts` do profile minimal para incluir `setErrorHandler` global estruturado.
- [ ] T002: Atualizar o logger em `app.ts` para prover suporte a `reqId` simplificado.
- [ ] T003: Expandir o teste interno `health.test.ts` para cobrir novo endpoint `/ready` devolvendo 200.

## Atualização de Roteamento Modular
- [ ] T004: Adicionar respostas unificadas `{ "data": ... }` no boilerplate Modular genérico.
- [ ] T005: Escrever `system.route.ts` englobando `/health` e `/ready` de forma unificada e limpa para as pastas de templates dos Profiles Modulares.

## Implementação Específica do Banco (Kysely)
- [ ] T006: Atualizar o handler de `/ready` no profile modular-postgres-kysely para importar e pingar a instância do `db` com timeout ou tratamento seguro de falha (`503`).
- [ ] T007: Modificar os schemas nativos de `users` inserindo o mapeamento restrito de body constraints (limite de caracteres, formatos) para testar os 400 Bad Request via JSON Schema do Fastify.
- [ ] T008: Parametrizar a blindagem total contra vazamento de queries SQL (500 internal).

## Extensão dos Evals (CI)
- [ ] T009: Atualizar todos os testes E2E (`eval-minimal.test.js`, `eval-modular.test.js`, `eval-modular-pg.test.js`) para engatilhar solicitações ao `/ready`.
- [ ] T010: No Kysely, garantir a execução de POST com body quebrado no teste local, comprovando 400 nativo via fastify Ajv.
