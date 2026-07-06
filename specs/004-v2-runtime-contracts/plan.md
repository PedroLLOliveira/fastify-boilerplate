# Plano de Implementação — V2 Runtime Contracts

O plano aborda o reuso e a adaptação do código base dos três perfis para injetar os contratos estritamente por modificação de templates (mantendo ausência de `replace()`).

## Camada de Logger
1. Em `app.ts`, o `Fastify({ logger: true })` receberá uma factory customizada de log, focada em expor o `requestId`.
2. O Fastify passará a assinar os cabeçalhos de resposta injetando um ID temporal simples para correlação entre client e servidor se a aplicação estiver em modo dev/prod.

## Interceptador Central de Erros
1. Iremos aplicar um `app.setErrorHandler` no arquivo central `app.ts` para todos os perfis.
2. Ele fará checkups de tipo:
   - Erros com classe `ValidationError` (Ajv) recebem `400`.
   - Lançamento de Erros de Unicidade em repositórios (PG) serão convertidos no serviço para mensagens detectáveis (ex: `'Email already in use'`) ou `409`.
   - Se for um `500` não tratado, ele será logado na console/arquivo (aproveitando o `request.log.error`) e a resposta devolvida ao client será uma generic message padronizada.

## Probe `/ready`
- Será adicionado um novo módulo em `src/modules/system` ou um anexo em `/health` contendo as rotas de resiliência.
- O profile Kysely instanciará a chamada de `sql\`SELECT 1\`.execute(db)` e testará a conexão ativamente.

## Plano de Testes a expandir
Para não ferirmos as evals já existentes, criaremos specs focadas em:
- `tests/ready.test.ts`: Testa Liveness e Readiness.
- `tests/users-errors.test.ts`: Testa schemas de body corrompidos (`400`) e erro em DB indisponível (`503` ou `500`).
