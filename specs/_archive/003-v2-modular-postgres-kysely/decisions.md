# Decisões — V2 Modular Postgres Kysely Profile

## 1. Por que Kysely sem um ORM Ativo?
**Contexto**: O mercado usa massivamente Prisma ou TypeORM para lidar com bancos SQL no TypeScript.
**Decisão**: Empregamos **Kysely**, um Query Builder TypeScript-first, combinado com a biblioteca clássica `pg`.
**Motivos**: 
- Segurança e Previsibilidade: ORMs pesados frequentemente geram queries imprevisíveis (N+1) e introduzem dezenas de megabytes ao bundle de servidor, além de engines nativas complexas na compilação.
- O Kysely foca estritamente na validação estática de SQL pelo TypeScript (Inferência), alinhando-se perfeitamente aos princípios do Fastify Boilerplate V2 de ser leve, nativo e robusto.

## 2. Abordagem Customizada de Migrations
**Contexto**: O Kysely oferece uma abstração interna de migrações (`Migrator`), mas não traz uma CLI instalável globalmente por padrão (dependemos de wrappers não-oficiais).
**Decisão**: O profile irá incluir um script nativo (`src/db/scripts/migrate.ts`) acessado via NPM Script (`npm run db:migrate`), rodando localmente usando `tsx`.
**Motivos**: Menos dependências abstratas injetadas no boilerplate. O usuário recebe o código de automação de migração e possui total autonomia para alterá-lo.

## 3. Isolamento Estrutural Restrito (Repository Pattern)
**Contexto**: Alguns templates injetam a instância do Query Builder direto nos Controllers (`handler.ts`), resultando em consultas SQL espalhadas.
**Decisão**: Restrição absoluta de uso do Kysely aos arquivos nomeados como `*.repository.ts`. Handlers chamam Services; Services chamam Repositories.
**Motivos**: Mantém a tipagem SQL e os testes unitários do Fastify limpos. O mock de infraestrutura de testes vira uma substituição simples dos métodos do Repository (que retornam objetos puros) sem precisar mockar o encadeamento inteiro do builder SQL do Kysely.
