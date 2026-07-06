# Contrato da aplicação gerada

## Garantias mínimas para todo profile suportado

- usa a versão de Node definida na matriz de compatibilidade;
- tem comando de desenvolvimento, typecheck/build, teste e lint que funcionam;
- expõe `GET /health` sem depender de serviços externos;
- registra plugins antes de rotas que dependam deles;
- valida entradas de rotas com schema;
- possui shutdown controlado para recursos de infraestrutura;
- contém README e `.env.example` coerentes;
- não grava credenciais reais nem depende de arquivos locais não versionados.

## Health route de referência

```ts
export default async function healthRoutes(app: FastifyInstance) {
  app.get('/health', {
    schema: {
      response: {
        200: {
          type: 'object',
          required: ['status'],
          properties: { status: { type: 'string' } },
        },
      },
    },
  }, async () => ({ status: 'ok' }));
}
```

O uso de schema para validação/serialização segue a recomendação do Fastify de trabalhar com JSON Schema. Ver [F-FASTIFY-VALIDATION].

## Teste de rota de referência

```ts
const app = await buildApp();
const response = await app.inject({ method: 'GET', url: '/health' });
assert.equal(response.statusCode, 200);
assert.deepEqual(response.json(), { status: 'ok' });
await app.close();
```

Ver [F-FASTIFY-TESTING].
