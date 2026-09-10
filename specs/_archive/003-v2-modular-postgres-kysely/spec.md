# 003 — V2 Modular Postgres Kysely Profile

## Problema
A fundação `modular` V2 resolve a organização de código para APIs em Node.js com TypeScript puro e rotas declarativas. No entanto, o próximo passo para uma API ser útil no mundo real é interagir com um banco de dados persistente de forma segura, com tipagem estrita (Type-Safe), suporte a migrações e encerramento limpo (Graceful Shutdown).

## Objetivo
Criar o profile `modular-postgres-kysely` integrado ao gerador V2. O projeto gerado deve entregar a arquitetura modular com PostgreSQL e utilizar o Query Builder **Kysely** para assegurar acesso a dados 100% tipado, com um plugin de ciclo de vida seguro no Fastify, repositório de dados isolado e suporte a migrações sem depender de ORMs como Prisma ou TypeORM.

## Interface da CLI
O gerador V2 mapeará o profile explicitamente por:
- Comando: `--profile modular-postgres-kysely`
- Esse bypass impedirá o usuário de combinar opções incompatíveis interativamente.

## Árvore do Projeto Gerado

```text
/
├── package.json
├── tsconfig.json
├── .eslintrc.cjs
├── .env.example
├── .gitignore
├── docker-compose.yml
├── src/
│   ├── server.ts
│   ├── app.ts
│   ├── config/
│   │   └── env.ts
│   ├── db/
│   │   ├── database.ts         (Tipagens globais do Kysely e instância do Dialect)
│   │   ├── migrations/
│   │   │   └── 0001_create_users.ts
│   │   └── scripts/
│   │       └── migrate.ts      (Script customizado para rodar as migrations)
│   ├── plugins/
│   │   └── db-pool.ts          (Plugin Fastify para gerenciar Lifecycle e Shutdown)
│   └── modules/
│       ├── health/
│       │   ├── health.route.ts
│       │   └── health.schema.ts
│       └── users/
│           ├── users.route.ts
│           ├── users.schema.ts
│           ├── users.handler.ts
│           ├── users.service.ts
│           └── users.repository.ts
└── tests/
    ├── setup.ts                (Inicialização do Docker/Pool de Teste se necessário)
    ├── health.test.ts
    └── users.test.ts
```

## Contratos e Regras de Negócio

### Dependências
Versões explícitas no catálogo do V2 Core:
- `pg`: `^8.11.5`
- `kysely`: `^0.27.3`

### Variáveis de Ambiente e Comportamento de Erro
- A variável `DATABASE_URL` é estritamente obrigatória no `src/config/env.ts`.
- O plugin `db-pool.ts` deve validar a presença da `DATABASE_URL` no start. Se ausente ou inválida, o Fastify não deve iniciar a aplicação (fail-fast) ao invés de lançar o erro apenas durante a primeira requisição.

### Fastify Plugin de Ciclo de Vida
O gerenciamento de conexão do Pool do `pg` deve ocorrer em um plugin no Fastify (`db-pool.ts`), utilizando `app.addHook('onClose', async () => pool.end())` para evitar resource leaks.

### Camada de Acesso a Dados e Isolamento
- Handlers HTTP (`*.handler.ts`) recebem a requisição e interagem **somente** com o `Service`.
- O `Service` orquestra a lógica de negócio e as invocações.
- O `Repository` (`users.repository.ts`) é a **única** camada que importa e executa queries usando a instância do `Kysely<Database>`. É explicitamente proibido vazar abstrações SQL ou a instância do Kysely para Handlers.

### Migrations
Sem um ORM monolítico, o projeto gerado usará a API oficial de Migrator do Kysely encapsulada no script `src/db/scripts/migrate.ts`.
- Scripts locais no package.json como `npm run db:migrate`.
- Primeira migração obrigatória: `0001_create_users.ts` com colunas `id` (uuid/serial) e `name`.

### Docker Compose
Para padronizar o desenvolvimento local, o gerador vai injetar um `docker-compose.yml` enxuto:
- Container: `postgres:16-alpine`.
- Credenciais padrão expostas para sync perfeito com o `.env.example`.

## Testes e Evals

- **Testes de Integração**: Diferente do Minimal, o Eval E2E vai submeter a máquina executora a inicializar um banco PostgreSQL real local ou usar o Docker antes de executar os testes da API gerada, provando o funcionamento da stack completa.
- **Eval Loop**:
  1. Geração limpa.
  2. `npm install`.
  3. Spin-up de um Postgres em porta efêmera (ou via Docker Compose local se em CI apropriada).
  4. Execução da migration gerada `npm run db:migrate`.
  5. Build via `tsc`.
  6. Teste de integração (`npm test`), validando a gravação real de um User.

## Fora de Escopo
- Bancos NoSQL, MySQL ou SQLite.
- Adaptação genérica do `UserRepository` (Repositório deve ser escrito à mão com SQL declarativo do Kysely).
- Rotinas de seeds (sem justificativa real nesta etapa, focaremos apenas no fluxo normal).

## Referências
- Kysely Migrations: [https://kysely.dev/docs/migrations](https://kysely.dev/docs/migrations)
- Fastify Lifecycle: [https://fastify.dev/docs/latest/Reference/Lifecycle/](https://fastify.dev/docs/latest/Reference/Lifecycle/)
- Node-Postgres (pg): [https://node-postgres.com/](https://node-postgres.com/)
