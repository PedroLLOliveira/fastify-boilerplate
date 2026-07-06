# Aceite — V2 Modular Postgres Kysely Profile

| Critério | Descrição | Status |
|---|---|---|
| CA-001 | `--profile modular-postgres-kysely` aciona a V2 e constrói o boilerplate corretamente, com dependências fixadas em SemVer puro. | pendente |
| CA-002 | Projeto gerado contém config centralizada de banco `src/db/`, arquivos `.ts` estritos para migrações e `docker-compose.yml`. | pendente |
| CA-003 | Ausência do `DATABASE_URL` provoca erro fatal na inicialização do Fastify via validação fail-fast no plugin. | pendente |
| CA-004 | Operações do banco são encapsuladas no `users.repository.ts`, blindando explicitamente os handlers do Query Builder. | pendente |
| CA-005 | Lifecycle implementa encerramento do Pool do PG usando `onClose` hook do Fastify. | pendente |
| CA-006 | Eval script no CI levanta banco efêmero no Docker, aplica `npm run db:migrate` e testa CRUD garantindo tipagem TypeScript. | pendente |
| CA-007 | Todos os outros profiles (`minimal`, `modular`) e legado v1 continuam passando em seus Evals originais sem contaminação das dependências da base nova. | pendente |
