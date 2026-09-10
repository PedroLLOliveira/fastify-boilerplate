# Aceite — V2 Runtime Contracts

| Critério | Descrição | Status |
|---|---|---|
| CA-001 | Endpoint `/health` responde 200 de forma síncrona sem injetar dependências externas nos 3 perfis. | pendente |
| CA-002 | Endpoint `/ready` responde `200` no minimal/modular, e responde `503` no kysely caso o Pool/banco seja indisponível. | pendente |
| CA-003 | Um erro fatal interno de banco de dados (`500`) é retornado no Kysely como `{ statusCode: 500, error: 'Internal Server Error', message: 'Something went wrong' }` ocultando detalhes SQL. | pendente |
| CA-004 | Uma requisição com corpo corrompido para criar usuário sofre recusa automática pelo Fastify (JSON Schema) emitindo 400 estruturado sem acessar a controladora HTTP. | pendente |
| CA-005 | Uma tentativa de e-mail duplicado lança `409 Conflict` (ou o formato customizado correspondente) explicitamente e previsivelmente. | pendente |
| CA-006 | Os Evals de todos os três perfis (`minimal`, `modular`, `modular-postgres-kysely`) refletem as atualizações e passam 100% verde localmente validando esses comportamentos e sem regressão. | pendente |
