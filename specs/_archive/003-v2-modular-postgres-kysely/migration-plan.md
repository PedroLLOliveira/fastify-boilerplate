# Plano de Migração — V2 Modular Postgres Kysely Profile

Como o Kysely é apenas um construtor de consultas TS (sem estado), o projeto gerado incorporará seu próprio mecanismo simples para executar as migrações, sem requerer CLI externas como o Prisma Migrate ou TypeORM CLI.

## Motor de Migração Incorporado
O arquivo `src/db/scripts/migrate.ts` conterá um loop básico usando a API interna do Kysely (`Migrator` e `FileMigrationProvider`). 

A rotina irá:
1. Conectar-se ao Postgres utilizando a variável `DATABASE_URL`.
2. Ler a pasta `src/db/migrations/*.ts` via `fs/promises`.
3. Executar o `migrator.migrateToLatest()` garantindo a execução determinística.
4. Finalizar a conexão.

## Anatomia de uma Migração (Padrão Kysely)
Toda migração exporta duas funções assíncronas puras (`up` e `down`):

*`0001_create_users.ts`*:
```typescript
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql\`gen_random_uuid()\`),)
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql\`now()\`).notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('users').execute()
}
```

## Como o Desenvolvedor usará
No projeto já gerado, o fluxo de evolução do banco passa a ser:
1. Criar novo arquivo seguindo o padrão de nomenclatura temporal em `src/db/migrations/` (ex: `0002_add_email.ts`).
2. Atualizar as tipagens TS em `src/db/database.ts` para refletir as novas colunas.
3. Rodar `npm run db:migrate`.
