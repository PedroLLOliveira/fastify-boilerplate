# 004 — V2 Runtime Contracts

## Problema
Embora os profiles V2 ofereçam a estrutura base para APIs modernas em Fastify, o comportamento em tempo de execução (tratamento de erros, formato de resposta, logs e sondas de resiliência) varia sutilmente e carece de previsibilidade corporativa. Ausência de contratos definidos pode resultar no vazamento de stack traces de banco de dados, falta de rastreabilidade (Request IDs) e problemas na integração com orquestradores como Kubernetes (Health vs Readiness).

## Objetivo
Padronizar os contratos transversais de runtime (HTTP, validação e observabilidade) para todos os profiles V2 existentes (`minimal`, `modular`, `modular-postgres-kysely`), sem adicionar ORMs extras, frameworks globais de erro complexos ou features fora do escopo central de uma API (auth/cache).

## Escopo dos Contratos

### Formato Consolidado de Respostas
**Sucesso (2xx):**
Toda resposta bem-sucedida deve entregar a carga dentro do envelopamento `data`.
```json
{
  "data": { "id": "123", "name": "Alice" }
}
```

**Erros (4xx e 5xx):**
O Fastify irá implementar um `setErrorHandler` global que interceptará falhas lançadas na aplicação.
```json
{
  "error": "Not Found",
  "message": "User not found",
  "statusCode": 404,
  "reqId": "req-1"
}
```
*Detalhes de DB (ex: Kysely Error) jamais serão serializados na chave `message` de respostas 500.*

### Mapeamento de Códigos de Domínio
1. **400 Bad Request:** Payload inválido (Validação nativa de Schema do Fastify / Ajv).
2. **404 Not Found:** Recurso inexistente (Identificado explicitamente no Service ou Handler).
3. **409 Conflict:** Violação de unicidade (ex: e-mail já existente).
4. **500 Internal Server Error:** Falhas catastróficas, Timeout ou desvios inesperados do banco.

### Sondas de Resiliência (K8s Patterns)
- **`/health` (Liveness):** Indica que a API HTTP está respondendo (`200 OK`). Retorna `{"status": "ok"}`. Aplicado transversalmente.
- **`/ready` (Readiness):** Indica que a API pode processar regras de negócio.
  - No `minimal` e `modular` (sem dependências externas): Retorna `200 OK`.
  - No `modular-postgres-kysely`: Dispara um ping ao PostgreSQL (`SELECT 1`). Se houver falha de rede/pool indisponível, devolve `503 Service Unavailable`.

### Logs Seguros e Rastreamento
- O Fastify deve ser instanciado com o Logger ativado (Pino).
- Deve injetar um `reqId` correlacionando requisições assíncronas.
- O logger global do app suprimirá logs de ambiente de testes (`NODE_ENV=test`) para manter o output do eval limpo.

## Evals e Testes
Os evals de cada profile precisarão ser expandidos para validar:
- Envio de JSON fora de tipagem disparando `400` contendo erro formatado.
- Endpoint `/ready` testado adequadamente.
- Requisições conflitantes retornando `409` no kysely e `reqId` atrelado no header ou payload.

## Fora de Escopo
- Autenticação e Rate Limiting.
- Frameworks de Erro customizados (ex: `@fastify/sensible` ou classes estendidas massivas). Utilizaremos instâncias de Erro puras ou HTTP-errors nativo.
- Swagger ou UI Docs (OpenAPI).
- Interação com RabbitMQ, Redis, etc.
