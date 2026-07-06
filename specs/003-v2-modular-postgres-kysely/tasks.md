# Tarefas — V2 Modular Postgres Kysely Profile

## Infraestrutura do Profile
- [ ] T001: Atualizar `lib/v2/core/catalog.js` com versões do `pg`, `pg-pool` e `kysely`.
- [ ] T002: Atualizar `bin/cli.js` adicionando `--profile modular-postgres-kysely`.
- [ ] T003: Adicionar a nova matriz e spec no arquivo `lib/v2/profiles/modular-pg-kysely.js`.

## Camada de Dependências e Bancos
- [ ] T004: Criar o template `docker-compose.yml`.
- [ ] T005: Criar plugin de lifecycle `db-pool.ts`.
- [ ] T006: Definir typings TypeScript `Database` para as instâncias do Kysely.
- [ ] T007: Criar templates de migrações (`src/db/scripts/migrate.ts` e `src/db/migrations/0001_create_users.ts`).

## Implementação do Domínio
- [ ] T008: Adaptar `app.ts` (do template Kysely) para inicializar o plugin de conexão antes do carregamento dos módulos.
- [ ] T009: Criar a implementação real baseada em banco do `users.repository.ts`.
- [ ] T010: Atualizar o `users.service.ts` e o `users.handler.ts` para conectar o fluxo com o banco de dados.

## Qualidade e Testes (E2E)
- [ ] T011: Elaborar o `tests/v2/eval-modular-pg.test.js` que envolva orquestrar o Postgres via Docker temporário, rodar as dependências e derrubar o ambiente com sucesso.
- [ ] T012: Documentar suporte no README e fechar Acceptance e Specs correspondentes.
