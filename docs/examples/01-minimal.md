# Exemplo — Minimal

## Quando usar

Serviços pequenos, APIs internas simples e início de projeto quando ainda não há domínio suficiente para justificar módulos formais.

## Estrutura

```text
src/
  app.ts
  server.ts
  routes/
    health.ts
    users.ts
```

## Exemplo de rota

```ts
export default async function usersRoutes(app: FastifyInstance) {
  app.post('/users', {
    schema: {
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          required: ['id', 'email'],
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const user = { id: crypto.randomUUID(), ...request.body };
    return reply.code(201).send(user);
  });
}
```

## Limites

Não adicionar controller/service/repository “por precaução”. Quando a rota acumular regras ou precisar compartilhar comportamento, migrar para Modular usando uma spec.

## Referências

- [F-FASTIFY-VALIDATION]
- [F-FASTIFY-PLUGINS]
